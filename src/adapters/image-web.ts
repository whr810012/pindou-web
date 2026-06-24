import type { ImageDataAdapter, LoadedImage, RenderGridOptions } from './types'
import { MAX_IMAGE_EDGE, getSafeDpr } from './types'
import type { MappedGrid } from '@pindou/bead-core'

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function readPixelsFromCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): Uint8ClampedArray {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not available')
  return ctx.getImageData(0, 0, width, height).data
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

function dimColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  if (Number.isNaN(n)) return '#E0E0E0'
  const r = ((n >> 16) & 0xff) * 0.35 + 200 * 0.65
  const g = ((n >> 8) & 0xff) * 0.35 + 200 * 0.65
  const b = (n & 0xff) * 0.35 + 200 * 0.65
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

function drawExternalCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  simple: boolean,
) {
  ctx.fillStyle = '#E4E4E4'
  ctx.fillRect(x, y, cellSize, cellSize)
  if (simple) return
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  const step = Math.max(4, Math.floor(cellSize / 3))
  for (let i = -cellSize; i < cellSize * 2; i += step) {
    ctx.beginPath()
    ctx.moveTo(x + i, y)
    ctx.lineTo(x + i + cellSize, y + cellSize)
    ctx.stroke()
  }
}

export function drawGridCell(
  ctx: CanvasRenderingContext2D,
  grid: MappedGrid,
  row: number,
  col: number,
  options: RenderGridOptions,
  cellSize: number,
) {
  const cell = grid[row]?.[col]
  if (!cell) return
  const x = col * cellSize
  const y = row * cellSize
  const key = `${row},${col}`
  const zoneActive = options.isZoneActive?.(row, col) ?? true

  if (cell.isExternal) {
    drawExternalCell(ctx, x, y, cellSize, !!options.simpleExternal)
  } else if (!zoneActive) {
    ctx.fillStyle = dimColor(cell.hex)
    ctx.fillRect(x, y, cellSize, cellSize)
  } else if (options.completedCells?.has(key)) {
    ctx.fillStyle = '#CCCCCC'
    ctx.fillRect(x, y, cellSize, cellSize)
  } else if (
    options.highlightPaletteId &&
    cell.paletteId !== options.highlightPaletteId
  ) {
    ctx.fillStyle = '#F0F0F0'
    ctx.fillRect(x, y, cellSize, cellSize)
  } else {
    ctx.fillStyle = cell.hex
    ctx.fillRect(x, y, cellSize, cellSize)
  }

  if (options.showGrid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.strokeRect(x, y, cellSize, cellSize)
  }

  if (options.showColorCode && !cell.isExternal && cellSize >= 12) {
    const code = options.brandCodeLookup?.(cell.paletteId) ?? ''
    if (code) {
      ctx.fillStyle = '#111'
      ctx.font = `${Math.max(8, Math.floor(cellSize * 0.35))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(code, x + cellSize / 2, y + cellSize / 2)
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: MappedGrid,
  options: RenderGridOptions,
  cellSize: number,
) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawGridCell(ctx, grid, row, col, options, cellSize)
    }
  }
}

function prepareCanvas(
  canvas: HTMLCanvasElement,
  canvasW: number,
  canvasH: number,
  dpr: number,
): CanvasRenderingContext2D {
  const pixelW = Math.round(canvasW * dpr)
  const pixelH = Math.round(canvasH * dpr)
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW
    canvas.height = pixelH
  }
  canvas.style.width = `${canvasW}px`
  canvas.style.height = `${canvasH}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

export const h5ImageAdapter: ImageDataAdapter = {
  async loadFromPath(path, maxEdge = MAX_IMAGE_EDGE) {
    const img = await loadImageElement(path)
    const scaled = scaleToMaxEdge(img.width, img.height, maxEdge)
    const canvas = document.createElement('canvas')
    canvas.width = scaled.width
    canvas.height = scaled.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, scaled.width, scaled.height)
    const pixels = readPixelsFromCanvas(canvas, scaled.width, scaled.height)
    return {
      path,
      width: scaled.width,
      height: scaled.height,
      pixels,
    }
  },

  renderGrid(canvas, grid, options) {
    const dpr = getSafeDpr()
    const rows = grid.length
    const cols = grid[0]?.length ?? 0
    const layoutW = options.layoutWidth ?? 0
    const cellSize = layoutW > 0 && cols > 0 ? layoutW / cols : options.cellSize
    const canvasW = cols * cellSize
    const canvasH = rows * cellSize
    const ctx = prepareCanvas(canvas, canvasW, canvasH, dpr)
    drawGrid(ctx, grid, options, cellSize)
  },

  exportCanvas(canvas) {
    return canvas.toDataURL('image/png')
  },
}

export { drawGrid, prepareCanvas, getSafeDpr }
