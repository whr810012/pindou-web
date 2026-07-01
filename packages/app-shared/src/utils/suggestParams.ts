import type { ImageAdjust, PhotoOptimize, PixelationMode } from '@wangdandan810012/bead-core'
import { DEFAULT_IMAGE_ADJUST, DEFAULT_PHOTO_OPTIMIZE } from '@wangdandan810012/bead-core'

export interface ImageContentHints {
  variance: number
  isPhotoLike: boolean
}

export function analyzeImageContent(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): ImageContentHints {
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
  return { variance: avgVariance, isPhotoLike: avgVariance > 100 }
}

/**
 * 照片：尽�?1 溝僝�?�?1 格（上陝 maxGrid），清晰度优先�? * 坡通：适度陝格去噪�? */
export function suggestGridWidth(
  imgWidth: number,
  imgHeight: number,
  maxGrid: number,
  isPhotoLike = true,
): number {
  const minEdge = Math.min(imgWidth, imgHeight)
  if (isPhotoLike) {
    return Math.max(48, Math.min(maxGrid, minEdge))
  }
  const target = Math.round(minEdge / 3)
  return Math.max(40, Math.min(maxGrid, target))
}

export function suggestModeForImage(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): PixelationMode {
  return analyzeImageContent(pixels, width, height).isPhotoLike ? 'average' : 'dominant'
}

export function suggestMergeThreshold(variance: number, isPhotoLike = variance > 100): number {
  if (isPhotoLike) return 0
  if (variance > 50) return 5
  return 7
}

export function suggestPalettePresetId(variance: number, isPhotoLike: boolean): string {
  if (isPhotoLike) return 'pindou-full'
  if (variance > 60) return 'pindou-168'
  return 'pindou-96'
}

export function suggestImageAdjust(isPhotoLike: boolean): ImageAdjust {
  if (!isPhotoLike) return { ...DEFAULT_IMAGE_ADJUST }
  return { brightness: 0, contrast: 12, saturation: 0 }
}

export function suggestPhotoOptimize(isPhotoLike: boolean): PhotoOptimize {
  if (!isPhotoLike) return { ...DEFAULT_PHOTO_OPTIMIZE }
  return { denoise: false, sharpen: true }
}

export interface SuggestedProjectParams {
  gridWidth: number
  mode: PixelationMode
  mergeThreshold: number
  maxColors: number
  palettePresetId: string
  imageAdjust: ImageAdjust
  photoOptimize: PhotoOptimize
}

export function buildSuggestedParams(
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
  maxGrid: number,
): SuggestedProjectParams {
  const hints = analyzeImageContent(pixels, width, height)
  return {
    gridWidth: suggestGridWidth(width, height, maxGrid, hints.isPhotoLike),
    mode: hints.isPhotoLike ? 'average' : 'dominant',
    mergeThreshold: suggestMergeThreshold(hints.variance, hints.isPhotoLike),
    maxColors: 0,
    palettePresetId: suggestPalettePresetId(hints.variance, hints.isPhotoLike),
    imageAdjust: suggestImageAdjust(hints.isPhotoLike),
    photoOptimize: suggestPhotoOptimize(hints.isPhotoLike),
  }
}
