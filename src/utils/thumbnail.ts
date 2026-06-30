import type { MappedGrid } from '@wangdandan810012/bead-core'

const PREVIEW_MAX = 160

export async function createSourcePreview(path: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const max = Math.max(img.width, img.height)
      const scale = max > PREVIEW_MAX ? PREVIEW_MAX / max : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => resolve('')
    img.src = path
  })
}

export async function renderGridThumbnail(grid: MappedGrid, maxSize = 96): Promise<string> {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  if (!rows || !cols) return ''

  const cell = Math.max(1, Math.floor(maxSize / Math.max(rows, cols)))
  const width = cols * cell
  const height = rows * cell

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellData = grid[row][col]
      ctx.fillStyle = cellData.isExternal ? '#f0f0f0' : cellData.hex
      ctx.fillRect(col * cell, row * cell, cell, cell)
    }
  }
  return canvas.toDataURL('image/png')
}

export function gridMeta(grid: MappedGrid) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const colors = new Set<string>()
  let beads = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.isExternal) continue
      beads++
      colors.add(cell.paletteId)
    }
  }
  return { rows, cols, beads, colorCount: colors.size }
}

export function renderGridFitBox(
  grid: MappedGrid,
  boxWidth: number,
  boxHeight: number,
  showGrid = false,
): string {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  if (!rows || !cols || boxWidth <= 0 || boxHeight <= 0) return ''

  const cell = Math.min(boxWidth / cols, boxHeight / rows)
  const drawW = cols * cell
  const drawH = rows * cell
  const ox = (boxWidth - drawW) / 2
  const oy = (boxHeight - drawH) / 2

  const canvas = document.createElement('canvas')
  canvas.width = boxWidth
  canvas.height = boxHeight
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, boxWidth, boxHeight)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellData = grid[row][col]
      const x = ox + col * cell
      const y = oy + row * cell
      ctx.fillStyle = cellData.isExternal ? '#E8E8E8' : cellData.hex
      ctx.fillRect(x, y, cell, cell)
      if (showGrid && cell >= 4) {
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'
        ctx.strokeRect(x, y, cell, cell)
      }
    }
  }
  return canvas.toDataURL('image/png')
}
