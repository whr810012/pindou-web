import { resolveNoteImages } from './resolveNote.js'
import { extractXhsUrls } from './extractUrl.js'
import { proxyImageToDataUrl } from './proxyImage.js'

export interface XhsParseRequest {
  text?: string
}

export interface XhsParseImage {
  id: string
  preview: string
  dataUrl: string
}

export interface XhsParseResponse {
  images?: XhsParseImage[]
  error?: string
  mock?: boolean
}

export interface XhsHandlerEnv {
  allowedOrigin?: string
  maxImageBytes?: number
  mock?: boolean
}

export function corsHeaders(origin = '*', contentType = 'application/json'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': contentType,
  }
}

export async function handleXhsParse(
  body: XhsParseRequest,
  env: XhsHandlerEnv = {},
): Promise<{ status: number; body: XhsParseResponse }> {
  const text = String(body.text ?? '').trim()
  if (!text) {
    return { status: 400, body: { error: 'text required' } }
  }

  const useMock = env.mock ?? process.env.XHS_MOCK === 'true'

  try {
    const resolved = await resolveNoteImages(text, { mock: useMock })
    const images: XhsParseImage[] = []
    const referer = extractXhsUrls(text)[0] ?? 'https://www.xiaohongshu.com/'

    for (const item of resolved.slice(0, 9)) {
      if (useMock) {
        const tiny =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        images.push({ id: item.id, preview: tiny, dataUrl: tiny })
        continue
      }

      try {
        const proxied = await proxyImageToDataUrl(item.id, item.url, {
          maxBytes: env.maxImageBytes,
          referer,
        })
        images.push(proxied)
      } catch {
        // skip individual image failures
      }
    }

    if (!images.length) {
      return {
        status: 502,
        body: {
          error:
            '未能下载笔记图片（CDN 防盗链或链接过期）。请尝试手机分享短链 xhslink.com，或手动保存图片后上传',
        },
      }
    }

    return { status: 200, body: { images, mock: useMock || undefined } }
  } catch (error) {
    const message = error instanceof Error ? error.message : '解析失败'
    return { status: 400, body: { error: message } }
  }
}
