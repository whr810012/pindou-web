import type { ImageAdjust, PhotoOptimize, PixelationMode } from '@wangdandan810012/bead-core'
import {
  DEFAULT_IMAGE_ADJUST,
  DEFAULT_PHOTO_OPTIMIZE,
  analyzeImageContent,
  countDistinctColors,
  computePrepTargetDimensions,
  suggestPrepColorCount,
  suggestGridWidthForPrepImage,
  suggestPrepMergeThreshold,
  type ImageContentHints,
  type PrepTargetDimensions,
} from '@wangdandan810012/bead-core'

export type { ImageContentHints, PrepTargetDimensions }

export {
  analyzeImageContent,
  countDistinctColors,
  computePrepTargetDimensions,
  suggestPrepColorCount,
  suggestGridWidthForPrepImage,
  suggestPrepMergeThreshold,
}

/**
 * 照片：尽量 1 源像素 → 1 格（上限 maxGrid），清晰度优先。
 * 卡通：适度降格去噪。
 */
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

export interface PrepImageMeta {
  gridWidth: number
  gridHeight: number
  colorCount?: number
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

export function suggestPrepPalettePresetId(colorCount: number): string {
  if (colorCount > 100) return 'pindou-full'
  if (colorCount > 64) return 'pindou-168'
  if (colorCount > 36) return 'pindou-168'
  return 'pindou-96'
}

/** 由拼豆专用图生成图纸时的参数建议 */
export function buildSuggestedParamsForPrepImage(
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
  maxGrid: number,
  meta?: PrepImageMeta,
): SuggestedProjectParams {
  const distinctColors = meta?.colorCount ?? countDistinctColors(pixels, width, height)
  const hints = analyzeImageContent(pixels, width, height)
  const gridWidth = meta?.gridWidth
    ? Math.max(40, Math.min(maxGrid, meta.gridWidth))
    : suggestGridWidthForPrepImage(width, height, maxGrid)

  return {
    gridWidth,
    mode: 'dominant',
    mergeThreshold: suggestPrepMergeThreshold(distinctColors, hints.variance),
    maxColors: 0,
    palettePresetId: suggestPrepPalettePresetId(distinctColors),
    imageAdjust: { ...DEFAULT_IMAGE_ADJUST },
    photoOptimize: { ...DEFAULT_PHOTO_OPTIMIZE },
  }
}
