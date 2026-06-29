import { describe, expect, it } from 'vitest'
import { analyzeImageContent, buildSuggestedParams, suggestMergeThreshold, suggestGridWidth } from './suggestParams.js'

function solidPixels(w: number, h: number, r: number, g: number, b: number): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    pixels[o] = r
    pixels[o + 1] = g
    pixels[o + 2] = b
    pixels[o + 3] = 255
  }
  return pixels
}

function gradientPixels(w: number, h: number): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      pixels[i] = Math.round((x / w) * 255)
      pixels[i + 1] = Math.round((y / h) * 255)
      pixels[i + 2] = Math.round(((x + y) / (w + h)) * 255)
      pixels[i + 3] = 255
    }
  }
  return pixels
}

describe('suggestParams', () => {
  it('detects photo-like high variance content', () => {
    const pixels = gradientPixels(128, 128)
    const hints = analyzeImageContent(pixels, 128, 128)
    expect(hints.isPhotoLike).toBe(true)
    expect(suggestMergeThreshold(hints.variance, true)).toBe(0)
  })

  it('suggests max grid for photos when within limit', () => {
    const pixels = gradientPixels(256, 256)
    const params = buildSuggestedParams(256, 256, pixels, 256)
    expect(params.mode).toBe('average')
    expect(params.mergeThreshold).toBe(0)
    expect(params.palettePresetId).toBe('pindou-full')
    expect(params.gridWidth).toBe(256)
    expect(params.photoOptimize.sharpen).toBe(true)
  })

  it('caps photo grid at maxGrid', () => {
    expect(suggestGridWidth(800, 600, 256, true)).toBe(256)
    expect(suggestGridWidth(400, 300, 256, true)).toBe(256)
    expect(suggestGridWidth(200, 200, 256, true)).toBe(200)
  })

  it('suggests cartoon-friendly params for flat images', () => {
    const pixels = solidPixels(200, 200, 40, 180, 90)
    const params = buildSuggestedParams(200, 200, pixels, 256)
    expect(params.mode).toBe('dominant')
    expect(params.mergeThreshold).toBeGreaterThanOrEqual(6)
    expect(params.palettePresetId).toBe('pindou-96')
  })
})
