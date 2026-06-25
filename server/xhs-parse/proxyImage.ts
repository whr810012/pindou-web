import { buildImageFetchCandidates } from './cdnUrl.js'
import { isAllowedCdnUrl } from './extractUrl.js'

const DEFAULT_MAX_BYTES = 4 * 1024 * 1024

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

export interface ProxiedImage {
  id: string
  preview: string
  dataUrl: string
}

export interface ProxyImageOptions {
  maxBytes?: number
  fetchImpl?: typeof fetch
  referer?: string
}

export async function proxyImageToDataUrl(
  id: string,
  url: string,
  options: ProxyImageOptions = {},
): Promise<ProxiedImage> {
  if (!isAllowedCdnUrl(url)) {
    throw new Error('不允许代理该图片地址')
  }

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const fetchFn = options.fetchImpl ?? fetch
  const referer = options.referer ?? 'https://www.xiaohongshu.com/'

  const candidates = buildImageFetchCandidates(url)
  let lastStatus = 0

  for (const candidate of candidates) {
    try {
      const response = await fetchFn(candidate, {
        headers: {
          Referer: referer,
          Origin: 'https://www.xiaohongshu.com',
          'User-Agent': DESKTOP_UA,
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
        redirect: 'follow',
      })

      if (!response.ok) {
        lastStatus = response.status
        continue
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        continue
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.byteLength < 64) continue

      if (buffer.byteLength > maxBytes) {
        throw new Error('图片过大（超过 4MB），请换一张或手动裁剪后上传')
      }

      const mime = contentType.startsWith('image/') ? contentType.split(';')[0]! : 'image/jpeg'
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`

      return {
        id,
        preview: dataUrl,
        dataUrl,
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('图片过大')) {
        throw error
      }
      // try next candidate
    }
  }

  if (lastStatus === 403 || lastStatus === 401) {
    throw new Error('图片 CDN 拒绝访问（签名/防盗链），请换手机短链或手动保存图片')
  }

  throw new Error(`图片下载失败（${lastStatus || '无可用地址'}）`)
}
