import { collectImageUrlsFromHtml, normalizeXhsImageUrl } from './cdnUrl.js'
import { extractXhsUrls, isAllowedXhsUrl } from './extractUrl.js'
import { buildFetchCandidates } from './noteUrl.js'

const MOCK_IMAGES = [
  'https://sns-img-hw.xhscdn.com/mock/sample-1.jpg',
  'https://sns-img-hw.xhscdn.com/mock/sample-2.jpg',
]

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

export interface ResolvedNoteImage {
  id: string
  url: string
}

export interface ResolveNoteOptions {
  mock?: boolean
  fetchImpl?: typeof fetch
}

export async function resolveNoteImages(
  text: string,
  options: ResolveNoteOptions = {},
): Promise<ResolvedNoteImage[]> {
  if (options.mock || process.env.XHS_MOCK === 'true') {
    return MOCK_IMAGES.map((url, index) => ({
      id: `mock-${index + 1}`,
      url: normalizeXhsImageUrl(url),
    }))
  }

  const urls = extractXhsUrls(text)
  if (!urls.length) {
    throw new Error('未找到小红书链接，请粘贴分享文案或短链')
  }

  const fetchFn = options.fetchImpl ?? fetch
  const noteUrl = urls[0]!
  if (!isAllowedXhsUrl(noteUrl)) {
    throw new Error('链接域名不在允许列表内')
  }

  const resolvedUrl = await followRedirects(noteUrl, fetchFn)
  const candidates = buildFetchCandidates(resolvedUrl)

  const attempts: Array<{ url: string; userAgent: string }> = []
  for (const url of candidates) {
    attempts.push({ url, userAgent: DESKTOP_UA })
    attempts.push({ url, userAgent: MOBILE_UA })
  }

  let lastError = '未能解析笔记图片，页面结构可能已变更，请手动保存图片后上传'

  for (const attempt of attempts) {
    try {
      const html = await fetchNoteHtml(attempt.url, fetchFn, attempt.userAgent)
      const imageUrls = collectImageUrlsFromHtml(html)
      if (imageUrls.length) {
        return imageUrls.map((url, index) => ({
          id: `img-${index + 1}`,
          url,
        }))
      }
      lastError = '页面中未找到笔记图片，请尝试手机分享短链或手动保存图片'
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : '无法获取笔记页，请手动保存图片后上传'
    }
  }

  throw new Error(lastError)
}

async function fetchNoteHtml(
  url: string,
  fetchFn: typeof fetch,
  userAgent: string,
): Promise<string> {
  const response = await fetchFn(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://www.xiaohongshu.com/',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`无法获取笔记页（${response.status}），请手动保存图片后上传`)
  }

  return response.text()
}

async function followRedirects(url: string, fetchFn: typeof fetch): Promise<string> {
  const response = await fetchFn(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': DESKTOP_UA,
      Referer: 'https://www.xiaohongshu.com/',
    },
  })
  return response.url || url
}
