import type { PixelationMode } from '@pindou/bead-core'

/** 根据裁剪后图片尺寸建议横向格数（约每 8 像素对应 1 格） */
export function suggestGridWidth(imgWidth: number, imgHeight: number, maxGrid: number): number {
  const minEdge = Math.min(imgWidth, imgHeight)
  const raw = Math.round(minEdge / 8)
  return Math.max(48, Math.min(maxGrid, raw))
}

/** 照片类图片更适合平均色 + 较低合并阈值 */
export function suggestModeForImage(pixels: Uint8ClampedArray, width: number, height: number): PixelationMode {
  const step = Math.max(1, Math.floor(Math.min(width, height) / 32))
  let prevL = 0
  let variance = 0
  let samples = 0

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      if (pixels[i + 3] < 128) continue
      const l = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
      if (samples > 0) {
        const d = l - prevL
        variance += d * d
      }
      prevL = l
      samples++
    }
  }

  const avgVariance = samples > 1 ? variance / (samples - 1) : 0
  return avgVariance > 120 ? 'average' : 'dominant'
}
