const DEFAULT_MAX_EDGE = 1024
const DEFAULT_JPEG_QUALITY = 0.88
const DEFAULT_MAX_BYTES = 3.5 * 1024 * 1024

export interface CompressImageOptions {
  maxEdge?: number
  quality?: number
  maxBytes?: number
}

/**
 * 压缩图片供 AI 预处理上传，控制 Netlify Function payload 与超时。
 */
export async function compressImageForAi(
  imagePath: string,
  options: CompressImageOptions = {},
): Promise<string> {
  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE
  const quality = options.quality ?? DEFAULT_JPEG_QUALITY
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES

  let dataUrl = await loadAndResize(imagePath, maxEdge, quality)

  if (estimateDataUrlBytes(dataUrl) <= maxBytes) {
    return dataUrl
  }

  for (const edge of [768, 640, 512]) {
    dataUrl = await loadAndResize(imagePath, edge, Math.min(quality, 0.82))
    if (estimateDataUrlBytes(dataUrl) <= maxBytes) {
      return dataUrl
    }
  }

  return dataUrl
}

function loadAndResize(path: string, maxEdge: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建画布'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = path
  })
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return Math.floor((base64.length * 3) / 4)
}
