import type { MappedGrid, PaletteEntry, PixelationMode } from '@wangdandan810012/bead-core'
import {
  createBeadPrepPixels,
  fillRegion,
  paintRect,
  prepareSourcePixels,
  runPipeline,
  trimGrid,
} from '@wangdandan810012/bead-core'
import { assetUrl } from '@/utils/assetUrl'

/** 落地页效果对比原图（与 LandingPage 一致） */
export const LANDING_COMPARE_BEFORE = assetUrl('/static/gallery/landing-compare-before.jpg')
export const LANDING_COMPARE_AFTER = assetUrl('/static/gallery/landing-compare-after.png')
/** 与落地页一致用全色系，demo 图已缩边以保证滑块流畅 */
export const DEMO_PALETTE_URL = assetUrl('/static/palettes/full.json')

/** 编辑控件用的少量色号 */
export const EDIT_SWATCH_IDS = [
  'neutral-000',
  'neutral-001',
  'neutral-008',
  'color-012',
  'color-048',
  'color-100',
  'color-160',
  'color-220',
]

export type DemoFrame = {
  label: string
  kind: 'pixels' | 'grid' | 'image'
  width: number
  height: number
  pixels?: Uint8ClampedArray
  grid?: MappedGrid
  imageSrc?: string
  caption?: string
}

export type PipelineDemoOptions = {
  gridWidth: number
  mode: PixelationMode
  mergeThreshold: number
  maxColors: number
  markBackground: boolean
}

export type PreprocessDemoOptions = {
  brightness: number
  contrast: number
  saturation: number
  sharpen: boolean
  denoise: boolean
}

export type PrepDemoOptions = {
  maxGrid: number
}

export type DemoAssets = {
  source: { pixels: Uint8ClampedArray; width: number; height: number }
  /** 展示用原图 URL（落地页 before） */
  beforeSrc: string
  /** 落地页成品图（仅作对照展示） */
  afterSrc: string
  palette: PaletteEntry[]
  backgroundPaletteIds: string[]
  editSwatches: PaletteEntry[]
}

let assetsPromise: Promise<DemoAssets> | null = null
let assetsCache: DemoAssets | null = null
const pipelineDemoCache = new Map<string, PipelineDemoResult>()
const preprocessDemoCache = new Map<string, PreprocessDemoResult>()
const prepDemoCache = new Map<string, PrepDemoResult>()

type PipelineDemoResult = {
  frames: DemoFrame[]
  statsText: string
  snippet: string
}

type PreprocessDemoResult = {
  frames: DemoFrame[]
  snippet: string
}

type PrepDemoResult = {
  frames: DemoFrame[]
  snippet: string
}

function rememberResult<T>(cache: Map<string, T>, key: string, result: T): T {
  if (cache.size >= 32) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, result)
  return result
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

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`无法加载图片: ${src}`))
    img.src = src
  })
}

async function loadPixelsFromUrl(src: string, maxEdge: number) {
  const img = await loadImageElement(src)
  const scaled = scaleToMaxEdge(img.naturalWidth, img.naturalHeight, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = scaled.width
  canvas.height = scaled.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D 不可用')
  ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
  return {
    pixels: ctx.getImageData(0, 0, scaled.width, scaled.height).data,
    width: scaled.width,
    height: scaled.height,
  }
}

function resolveBackgroundIds(entries: PaletteEntry[]): string[] {
  const whites = new Set(['#FFFFFF', '#FEFEFE', '#F5F5F5', '#F4F4F4', '#FAFAFA', '#E0E0E0'])
  const normalize = (hex: string) => {
    const compact = hex.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
    return compact.length === 6 ? `#${compact.toUpperCase()}` : ''
  }
  const exact = entries.filter((e) => whites.has(normalize(e.hex)))
  if (exact.length) return exact.slice(0, 3).map((e) => e.id)
  const neutrals = entries
    .filter((e) => /^neutral-00[0-2]$/i.test(e.id))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (neutrals.length) return neutrals.map((e) => e.id)
  return entries[0] ? [entries[0].id] : []
}

function pickEditSwatches(entries: PaletteEntry[]): PaletteEntry[] {
  const byId = new Map(entries.map((e) => [e.id, e]))
  const picked: PaletteEntry[] = []
  for (const id of EDIT_SWATCH_IDS) {
    const hit = byId.get(id)
    if (hit) picked.push(hit)
  }
  if (picked.length >= 4) return picked
  // 回退：取色板前若干项
  return entries.slice(0, 8)
}

/** 加载落地页对比原图 + 子集色板（只加载一次） */
export function ensureDemoAssets(maxEdge = 160): Promise<DemoAssets> {
  if (assetsCache) return Promise.resolve(assetsCache)
  if (assetsPromise) return assetsPromise

  assetsPromise = (async () => {
    const [source, paletteJson] = await Promise.all([
      loadPixelsFromUrl(LANDING_COMPARE_BEFORE, maxEdge),
      fetch(DEMO_PALETTE_URL).then((r) => {
        if (!r.ok) throw new Error('无法加载色板')
        return r.json() as Promise<{ entries: PaletteEntry[] }>
      }),
    ])
    const palette = paletteJson.entries
    const assets: DemoAssets = {
      source,
      beforeSrc: LANDING_COMPARE_BEFORE,
      afterSrc: LANDING_COMPARE_AFTER,
      palette,
      backgroundPaletteIds: resolveBackgroundIds(palette),
      editSwatches: pickEditSwatches(palette),
    }
    assetsCache = assets
    return assets
  })().catch((err) => {
    assetsPromise = null
    throw err
  })

  return assetsPromise
}

export function getDemoAssetsSync(): DemoAssets | null {
  return assetsCache
}

/** @deprecated 保留名给旧调用；现改为落地页原图 */
export function getDemoSource(_size?: number) {
  if (!assetsCache) {
    throw new Error('Demo 资源未加载，请先 await ensureDemoAssets()')
  }
  return assetsCache.source
}

export function paintPixelsToCanvas(
  canvas: HTMLCanvasElement,
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) {
  canvas.width = width
  canvas.height = height
  canvas.removeAttribute('style')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
  ctx.putImageData(imageData, 0, 0)
}

export function paintGridToCanvas(canvas: HTMLCanvasElement, grid: MappedGrid, cellSize = 10) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  canvas.width = Math.max(1, cols * cellSize)
  canvas.height = Math.max(1, rows * cellSize)
  canvas.removeAttribute('style')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c]
      if (cell.isExternal) {
        ctx.fillStyle = '#e8eaef'
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        ctx.beginPath()
        ctx.moveTo(c * cellSize, r * cellSize + cellSize)
        ctx.lineTo(c * cellSize + cellSize, r * cellSize)
        ctx.stroke()
      } else {
        ctx.fillStyle = cell.hex
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.strokeRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1)
    }
  }
}

export function cellFromCanvasEvent(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  grid: MappedGrid,
): { row: number; col: number } | null {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  if (!rows || !cols) return null
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const col = Math.floor((x / rect.width) * cols)
  const row = Math.floor((y / rect.height) * rows)
  if (row < 0 || col < 0 || row >= rows || col >= cols) return null
  return { row, col }
}

function requireAssets(): DemoAssets {
  if (!assetsCache) throw new Error('Demo 资源未加载')
  return assetsCache
}

export function buildPipelineDemo(options: PipelineDemoOptions): PipelineDemoResult {
  const cacheKey = JSON.stringify(options)
  const cached = pipelineDemoCache.get(cacheKey)
  if (cached) return cached

  const { source, beforeSrc, afterSrc, palette, backgroundPaletteIds } = requireAssets()
  const adjusted = prepareSourcePixels(
    source.pixels,
    source.width,
    source.height,
    { brightness: 0, contrast: 8, saturation: 0 },
    { denoise: false, sharpen: true },
  )
  const { grid } = runPipeline(adjusted, source.width, source.height, {
    gridWidth: options.gridWidth,
    mode: options.mode,
    mergeThreshold: options.mergeThreshold,
    maxColors: options.maxColors,
    palette,
    backgroundPaletteIds: options.markBackground ? backgroundPaletteIds : [],
    excludedPaletteIds: [],
  })
  const trimmed = trimGrid(grid)
  const beadCount = trimmed.flat().filter((c) => !c.isExternal).length
  const gw = trimmed[0]?.length ?? 0
  const gh = trimmed.length
  return rememberResult(pipelineDemoCache, cacheKey, {
    frames: [
      {
        label: '落地页原图',
        kind: 'image',
        width: source.width,
        height: source.height,
        imageSrc: beforeSrc,
        caption: 'landing-compare-before',
      },
      {
        label: 'runPipeline',
        kind: 'grid',
        width: gw,
        height: gh,
        grid: trimmed,
        caption: `${gw}×${gh} · ${beadCount} 豆`,
      },
      {
        label: '落地页成品',
        kind: 'image',
        width: gw,
        height: gh,
        imageSrc: afterSrc,
        caption: 'landing-compare-after',
      },
    ],
    statsText: `互动结果 ${gw}×${gh}，有效豆 ${beadCount}（右侧为落地页对照）`,
    snippet: `runPipeline(pixels, w, h, {
  gridWidth: ${options.gridWidth},
  mode: '${options.mode}',
  mergeThreshold: ${options.mergeThreshold},
  maxColors: ${options.maxColors},
  palette, // pindou-full
  backgroundPaletteIds: ${options.markBackground ? JSON.stringify(backgroundPaletteIds.slice(0, 3)) : '[]'},
})`,
  })
}

export function buildPreprocessDemo(options: PreprocessDemoOptions): PreprocessDemoResult {
  const cacheKey = JSON.stringify(options)
  const cached = preprocessDemoCache.get(cacheKey)
  if (cached) return cached

  const { source, beforeSrc } = requireAssets()
  const adjusted = prepareSourcePixels(
    source.pixels,
    source.width,
    source.height,
    {
      brightness: options.brightness,
      contrast: options.contrast,
      saturation: options.saturation,
    },
    { denoise: options.denoise, sharpen: options.sharpen },
  )
  return rememberResult(preprocessDemoCache, cacheKey, {
    frames: [
      {
        label: '原图',
        kind: 'image',
        width: source.width,
        height: source.height,
        imageSrc: beforeSrc,
      },
      {
        label: '预处理后',
        kind: 'pixels',
        width: source.width,
        height: source.height,
        pixels: adjusted,
      },
    ],
    snippet: `prepareSourcePixels(pixels, w, h,
  { brightness: ${options.brightness}, contrast: ${options.contrast}, saturation: ${options.saturation} },
  { denoise: ${options.denoise}, sharpen: ${options.sharpen} },
)`,
  })
}

export function buildPrepDemo(options: PrepDemoOptions): PrepDemoResult {
  const cacheKey = JSON.stringify(options)
  const cached = prepDemoCache.get(cacheKey)
  if (cached) return cached

  const { source, beforeSrc, palette, backgroundPaletteIds } = requireAssets()
  const prep = createBeadPrepPixels(source.pixels, source.width, source.height, options.maxGrid)
  const { grid } = runPipeline(prep.pixels, prep.width, prep.height, {
    gridWidth: prep.gridWidth,
    mode: 'dominant',
    mergeThreshold: 0,
    maxColors: 0,
    palette,
    backgroundPaletteIds,
    excludedPaletteIds: [],
    flatTile: true,
  })
  return rememberResult(prepDemoCache, cacheKey, {
    frames: [
      {
        label: '原图',
        kind: 'image',
        width: source.width,
        height: source.height,
        imageSrc: beforeSrc,
      },
      {
        label: 'Prep',
        kind: 'pixels',
        width: prep.width,
        height: prep.height,
        pixels: prep.pixels,
        caption: `${prep.width}×${prep.height}`,
      },
      {
        label: 'flatTile',
        kind: 'grid',
        width: grid[0]?.length ?? 0,
        height: grid.length,
        grid,
        caption: `${grid[0]?.length ?? 0}×${grid.length}`,
      },
    ],
    snippet: `const prep = createBeadPrepPixels(pixels, w, h, ${options.maxGrid})
runPipeline(prep.pixels, prep.width, prep.height, {
  gridWidth: prep.gridWidth,
  mode: 'dominant',
  flatTile: true,
})`,
  })
}

export function createEditBaseGrid(): MappedGrid {
  const { source, palette, backgroundPaletteIds } = requireAssets()
  const { grid } = runPipeline(source.pixels, source.width, source.height, {
    gridWidth: 20,
    mode: 'average',
    mergeThreshold: 6,
    maxColors: 0,
    palette,
    backgroundPaletteIds,
    excludedPaletteIds: [],
  })
  return trimGrid(grid)
}

export function applyEditFill(
  grid: MappedGrid,
  row: number,
  col: number,
  paletteId: string,
  hex: string,
): MappedGrid {
  return fillRegion(grid, row, col, paletteId, hex)
}

export function applyEditPaint(
  grid: MappedGrid,
  row: number,
  col: number,
  paletteId: string,
  hex: string,
): MappedGrid {
  return paintRect(grid, row, col, row, col, paletteId, hex)
}

/** 色板 playground 展示用（加载后可用） */
export function getDemoPalettePreview(): PaletteEntry[] {
  return assetsCache?.editSwatches ?? []
}
