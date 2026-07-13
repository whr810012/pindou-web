import { createPixelArtPrepPixels } from '@wangdandan810012/bead-core'
import { MAX_IMAGE_EDGE } from '@/adapters/types'
import { getMaxGridWidth } from '@/adapters'

export interface PixelArtProgress {
  percent: number
  message: string
}

export interface PixelArtResult {
  dataUrl: string
  pixels: Uint8ClampedArray
  width: number
  height: number
  gridWidth: number
  gridHeight: number
  colorCount: number
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('无法读取图片'))
    img.src = path
  })
}

function scaleToMaxEdge(width: number, height: number, maxEdge: number) {
  const max = Math.max(width, height)
  if (max <= maxEdge) return { width, height }
  const ratio = maxEdge / max
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

async function loadImagePixels(imagePath: string) {
  const img = await loadImage(imagePath)
  const scaled = scaleToMaxEdge(img.width, img.height, MAX_IMAGE_EDGE)
  const canvas = document.createElement('canvas')
  canvas.width = scaled.width
  canvas.height = scaled.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
  return {
    width: scaled.width,
    height: scaled.height,
    pixels: ctx.getImageData(0, 0, scaled.width, scaled.height).data,
  }
}

function pixelsToDataUrl(pixels: Uint8ClampedArray, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')
  ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0)
  return canvas.toDataURL('image/png')
}

/** 浏览器端：加载图片并调用 bead-core 生成经典像素风中间图 */
export async function createPixelArtImage(
  imagePath: string,
  onProgress?: (progress: PixelArtProgress) => void,
): Promise<PixelArtResult> {
  onProgress?.({ percent: 5, message: '读取图片…' })
  const { pixels, width, height } = await loadImagePixels(imagePath)

  onProgress?.({ percent: 20, message: '最近邻像素化…' })
  const result = createPixelArtPrepPixels(pixels, width, height, getMaxGridWidth())

  onProgress?.({ percent: 88, message: '生成像素风图…' })
  const dataUrl = pixelsToDataUrl(result.pixels, result.width, result.height)
  onProgress?.({ percent: 100, message: '完成' })

  return {
    dataUrl,
    pixels: result.pixels,
    width: result.width,
    height: result.height,
    gridWidth: result.gridWidth,
    gridHeight: result.gridHeight,
    colorCount: result.colorCount,
  }
}
