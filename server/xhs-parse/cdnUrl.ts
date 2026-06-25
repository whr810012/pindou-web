import { isAllowedCdnUrl } from './extractUrl.js'

const CDN_HOST = 'sns-img-hw.xhscdn.com'

const STATE_MARKERS = [
  'window.__INITIAL_STATE__=',
  'window.__INITIAL_STATE__ =',
  'window.__SETUP_SERVER_STATE__=',
  'window.__UNIVERSAL_DATA_FOR_REHYDRATION__=',
]

const SKIP_URL_HINTS = [
  '/avatar/',
  'avatar.',
  'sns-avatar',
  'user_banner',
  '/fe-platform/',
  'fe-platform.xhscdn.com',
  'picasso-static',
  'logo',
  'emoji',
  'watermark',
]

/** 从笔记页 HTML 中提取图片 URL */
export function collectImageUrlsFromHtml(html: string): string[] {
  const decoded = decodeHtmlEscapes(html)
  const urls = new Set<string>()

  for (const marker of STATE_MARKERS) {
    const json = extractJsonAfterMarker(decoded, marker)
    if (json) {
      try {
        const state = JSON.parse(json.replace(/undefined/g, 'null')) as unknown
        walkForUrls(state, urls)
      } catch {
        // ignore malformed state
      }
    }
  }

  collectJsonLdImages(decoded, urls)
  collectMetaImages(decoded, urls)
  collectRawCdnUrls(decoded, urls)

  return rankNoteImages([...urls])
}

function decodeHtmlEscapes(text: string): string {
  return text
    .replace(/\\u002F/gi, '/')
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003A/gi, ':')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
}

function extractJsonAfterMarker(html: string, marker: string): string | null {
  const idx = html.indexOf(marker)
  if (idx < 0) return null

  let start = idx + marker.length
  while (start < html.length && /\s/.test(html[start]!)) start += 1

  const open = html[start]
  if (open !== '{' && open !== '[') return null

  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < html.length; i++) {
    const ch = html[i]!
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) return html.slice(start, i + 1)
    }
  }

  return null
}

function collectJsonLdImages(html: string, urls: Set<string>): void {
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const match of html.matchAll(pattern)) {
    try {
      const data = JSON.parse(match[1]!) as unknown
      walkForUrls(data, urls)
    } catch {
      // ignore
    }
  }
}

function collectMetaImages(html: string, urls: Set<string>): void {
  const ogPattern =
    /<meta[^>]+property=["'](?:og:image|og:image:url)["'][^>]+content=["']([^"']+)["']/gi
  for (const match of html.matchAll(ogPattern)) {
    addIfCdn(urls, match[1]!)
  }

  const reverseOg =
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:image|og:image:url)["']/gi
  for (const match of html.matchAll(reverseOg)) {
    addIfCdn(urls, match[1]!)
  }
}

function collectRawCdnUrls(html: string, urls: Set<string>): void {
  const patterns = [
    /https?:\\\/\\\/[^"'\s]+?xhscdn\.com[^"'\s]*/gi,
    /https?:\/\/[^"'\s\\]+?xhscdn\.com\/[^"'\s\\]+/gi,
    /"url(?:Default)?"\s*:\s*"([^"]*xhscdn\.com[^"]*)"/gi,
    /"url"\s*:\s*"([^"]*xhscdn\.com[^"]*)"/gi,
    /"originUrl"\s*:\s*"([^"]*xhscdn\.com[^"]*)"/gi,
  ]

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const raw = match[1] ?? match[0]
      addIfCdn(urls, raw)
    }
  }
}

function addIfCdn(urls: Set<string>, raw: string): void {
  const cleaned = decodeHtmlEscapes(raw.replace(/\\"/g, '"').trim())
  if (!cleaned.includes('xhscdn.com')) return
  if (!isLikelyNoteImage(cleaned)) return
  try {
    urls.add(normalizeXhsImageUrl(cleaned))
  } catch {
    // skip invalid
  }
}

function walkForUrls(value: unknown, urls: Set<string>, depth = 0): void {
  if (depth > 16 || value == null) return
  if (typeof value === 'string') {
    if (value.includes('xhscdn.com') && isLikelyNoteImage(value)) {
      try {
        urls.add(normalizeXhsImageUrl(value))
      } catch {
        // skip
      }
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walkForUrls(item, urls, depth + 1))
    return
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const [key, entry] of Object.entries(obj)) {
      if (
        (key === 'url' || key === 'urlDefault' || key === 'originUrl' || key === 'imageUrl') &&
        typeof entry === 'string' &&
        entry.includes('xhscdn.com')
      ) {
        addIfCdn(urls, entry)
      }
      walkForUrls(entry, urls, depth + 1)
    }
  }
}

function isLikelyNoteImage(url: string): boolean {
  const lower = url.toLowerCase()
  if (!lower.includes('xhscdn.com')) return false
  if (SKIP_URL_HINTS.some((hint) => lower.includes(hint))) return false
  if (lower.includes('sns-webpic')) return true
  if (lower.includes('sns-img')) return true
  if (lower.includes('sns-avatar')) return false
  return (
    /\.(jpe?g|png|webp)/i.test(lower) ||
    lower.includes('/notes/') ||
    /nd_dft|nd_prv|_jpg_|_webp_/.test(lower)
  )
}

function rankNoteImages(urls: string[]): string[] {
  const unique = new Map<string, string>()
  for (const url of urls) {
    try {
      const parsed = new URL(url)
      const key = parsed.pathname + (parsed.pathname.includes('!') ? '' : parsed.search)
      if (!unique.has(key)) unique.set(key, url)
    } catch {
      // skip
    }
  }

  return [...unique.values()].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a))
}

function scoreImageUrl(url: string): number {
  const lower = url.toLowerCase()
  let score = 0
  if (lower.includes('fe-platform')) score -= 50
  if (lower.includes('sns-webpic')) score += 15
  if (lower.includes('nd_dft')) score += 8
  if (lower.includes('sns-img')) score += 10
  if (lower.includes('/notes/') || lower.includes('note')) score += 5
  if (/\.(jpe?g|png|webp)/.test(lower)) score += 2
  if (lower.includes('imageview2')) score += 1
  if (lower.includes('nd_prv')) score -= 2
  return score
}

/** 重组为可用的 CDN 地址（保留原 host 与 query，下载时再尝试多种变体） */
export function normalizeXhsImageUrl(url: string): string {
  const trimmed = decodeHtmlEscapes(url.trim())
  if (!trimmed.startsWith('http')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (!isAllowedCdnUrl(parsed.href)) return trimmed
    return parsed.href
  } catch {
    return trimmed
  }
}

/** 生成图片下载候选 URL（原链、裸链、多 CDN 节点、imageView2） */
export function buildImageFetchCandidates(rawUrl: string): string[] {
  const decoded = decodeHtmlEscapes(rawUrl.trim())
  const seen = new Set<string>()
  const list: string[] = []

  const add = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return
    try {
      if (!isAllowedCdnUrl(url)) return
    } catch {
      return
    }
    seen.add(url)
    list.push(url)
  }

  add(decoded)

  try {
    const parsed = new URL(decoded)
    const path = parsed.pathname
    if (!path || path === '/') return list

    const isWebpic = parsed.hostname.toLowerCase().includes('sns-webpic')
    const hosts = isWebpic
      ? [parsed.hostname]
      : [
          parsed.hostname,
          'sns-img-hw.xhscdn.com',
          'sns-img-qc.xhscdn.com',
          'sns-img-bd.xhscdn.com',
        ]

    for (const host of [...new Set(hosts.map((h) => h.toLowerCase()))]) {
      const base = `https://${host}${path}`
      add(base)
      if (!isWebpic) {
        add(`${base}?imageView2/2/w/1080/format/webp`)
        add(`${base}?imageView2/2/w/1080/format/jpg`)
        add(`${base}?imageView2/2/w/720/format/webp`)
      }
    }
  } catch {
    // keep decoded only
  }

  return list
}

export function buildCdnUrl(pathOrUrl: string, width = 1080): string {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `https://${CDN_HOST}/${pathOrUrl.replace(/^\//, '')}`

  const parsed = new URL(url)
  if (!isAllowedCdnUrl(parsed.href)) {
    throw new Error('不允许的 CDN 域名')
  }

  parsed.search = ''
  parsed.hash = ''
  return `${parsed.origin}${parsed.pathname}?imageView2/2/w/${width}/format/webp`
}
