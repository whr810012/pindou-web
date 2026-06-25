import type { AiPreprocessStyle } from './aiPreprocess'

export async function runLocalAiMock(imagePath: string, style: AiPreprocessStyle): Promise<string> {
  return applyH5Filter(imagePath, style)
}

function applyH5Filter(path: string, style: AiPreprocessStyle): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const max = 512
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i]
        let g = data[i + 1]
        let b = data[i + 2]

        if (style === 'cartoon' || style === 'flat') {
          const step = style === 'flat' ? 48 : 32
          r = Math.round(r / step) * step
          g = Math.round(g / step) * step
          b = Math.round(b / step) * step
        } else if (style === 'sketch') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          const edge = gray > 128 ? 255 : 60
          r = g = b = edge
        } else if (style === 'enhance') {
          r = Math.min(255, r * 1.08 + 8)
          g = Math.min(255, g * 1.08 + 8)
          b = Math.min(255, b * 1.08 + 8)
        } else if (style === 'matting') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          if (gray > 235) {
            r = g = b = 255
          }
        }

        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = reject
    img.src = path
  })
}
