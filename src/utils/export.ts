import type { BrandSystem, ColorStat, MappedGrid } from '@wangdandan810012/bead-core'
import { computeColorStats } from '@wangdandan810012/bead-core'
import type { ExportSettings } from '@/types/app'
import { BOARD_SIZE, BEADS_PER_BAG } from '@/types/app'

export { BOARD_SIZE, BEADS_PER_BAG }

export function buildColorStats(
  grid: MappedGrid,
  brand: BrandSystem,
  codeLookup: (paletteId: string) => string,
): ColorStat[] {
  return computeColorStats(grid, brand, codeLookup)
}

export function exportStatsCsv(stats: ColorStat[], beadsPerBag = BEADS_PER_BAG): string {
  const header = 'code,hex,count,bags\n'
  const rows = stats
    .map((s) => {
      const bags = Math.ceil(s.count / beadsPerBag)
      return `${s.displayCode},${s.hex},${s.count},${bags}`
    })
    .join('\n')
  return header + rows
}

export function downloadTextH5(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadDataUrlH5(filename: string, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function downloadBlobH5(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function renderPatternCanvas(
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
): Promise<string> {
  const layout = getPatternLayout(grid, settings.cellSize, settings.showRuler)
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!
  drawPattern(ctx, grid, settings, codeLookup, layout)
  return canvas.toDataURL('image/png')
}

interface PatternLayout {
  rows: number
  cols: number
  offsetX: number
  offsetY: number
  width: number
  height: number
}

const RULER_TOP = 22
const RULER_LEFT = 30
const PDF_HEADER = 36

function getPatternLayout(grid: MappedGrid, cellSize: number, showRuler: boolean): PatternLayout {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const offsetX = showRuler ? RULER_LEFT : 0
  const offsetY = showRuler ? RULER_TOP : 0
  return {
    rows,
    cols,
    offsetX,
    offsetY,
    width: cols * cellSize + offsetX,
    height: rows * cellSize + offsetY,
  }
}

function drawRuler(ctx: CanvasRenderingContext2D, layout: PatternLayout, cellSize: number) {
  const { rows, cols, offsetX, offsetY, width, height } = layout
  ctx.fillStyle = '#f4f5f7'
  ctx.fillRect(0, 0, width, offsetY)
  ctx.fillRect(0, 0, offsetX, height)
  ctx.strokeStyle = '#ccc'
  ctx.beginPath()
  ctx.moveTo(offsetX, offsetY - 0.5)
  ctx.lineTo(width, offsetY - 0.5)
  ctx.moveTo(offsetX - 0.5, offsetY)
  ctx.lineTo(offsetX - 0.5, height)
  ctx.stroke()

  ctx.fillStyle = '#444'
  ctx.font = '10px sans-serif'
  const step = cols > 60 ? 10 : cols > 30 ? 5 : 1

  for (let col = 0; col < cols; col++) {
    if (col % step !== 0 && col !== cols - 1) continue
    const x = offsetX + col * cellSize + cellSize / 2
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(col), x, offsetY / 2)
  }

  for (let row = 0; row < rows; row++) {
    if (row % step !== 0 && row !== rows - 1) continue
    const y = offsetY + row * cellSize + cellSize / 2
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(row), offsetX - 6, y)
  }
}

function drawBoardLines(
  ctx: CanvasRenderingContext2D,
  layout: PatternLayout,
  cellSize: number,
) {
  const { rows, cols, offsetX, offsetY } = layout
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 2

  for (let col = BOARD_SIZE; col < cols; col += BOARD_SIZE) {
    const x = offsetX + col * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(x, offsetY)
    ctx.lineTo(x, offsetY + rows * cellSize)
    ctx.stroke()
  }

  for (let row = BOARD_SIZE; row < rows; row += BOARD_SIZE) {
    const y = offsetY + row * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(offsetX, y)
    ctx.lineTo(offsetX + cols * cellSize, y)
    ctx.stroke()
  }
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
  layout: PatternLayout,
) {
  const cellSize = settings.cellSize
  if (settings.showRuler) drawRuler(ctx, layout, cellSize)

  const { rows, cols, offsetX, offsetY } = layout
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col]
      if (cell.isExternal) continue
      const x = offsetX + col * cellSize
      const y = offsetY + row * cellSize
      ctx.fillStyle = cell.hex
      ctx.fillRect(x, y, cellSize, cellSize)
      if (settings.showGrid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, cellSize, cellSize)
      }
      if (settings.showColorCode) {
        ctx.fillStyle = '#111'
        ctx.font = `${Math.max(8, Math.floor(cellSize * 0.35))}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(codeLookup(cell.paletteId), x + cellSize / 2, y + cellSize / 2)
      }
      if (settings.showCoordinates) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.font = `${Math.max(7, Math.floor(cellSize * 0.22))}px sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${col},${row}`, x + 2, y + 2)
      }
    }
  }

  if (settings.showBoardLines) {
    drawBoardLines(ctx, layout, cellSize)
  }
}

function boardColumnLetter(index: number): string {
  let n = index
  let label = ''
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

export function boardLabel(boardCol: number, boardRow: number): string {
  return `${boardColumnLetter(boardCol)}${boardRow + 1}`
}

function sliceGrid(
  grid: MappedGrid,
  startRow: number,
  startCol: number,
  size: number,
): MappedGrid {
  const slice: MappedGrid = []
  for (let r = 0; r < size; r++) {
    const srcRow = startRow + r
    if (srcRow >= grid.length) break
    const row = []
    for (let c = 0; c < size; c++) {
      const srcCol = startCol + c
      if (srcCol >= (grid[0]?.length ?? 0)) break
      row.push({ ...grid[srcRow][srcCol] })
    }
    if (row.length) slice.push(row)
  }
  return slice
}

async function renderGridToDataUrl(
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
): Promise<string> {
  const layout = getPatternLayout(grid, settings.cellSize, settings.showRuler)
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!
  drawPattern(ctx, grid, settings, codeLookup, layout)
  return canvas.toDataURL('image/png')
}

export async function renderStatsCanvas(stats: ColorStat[]): Promise<string> {
  const rowHeight = 28
  const height = Math.max(120, stats.length * rowHeight + 40)
  const width = 320

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#111'
  ctx.font = '14px sans-serif'
  ctx.fillText('采购清单', 12, 24)
  stats.forEach((stat, index) => {
    const y = 40 + index * rowHeight
    ctx.fillStyle = stat.hex
    ctx.fillRect(12, y, 20, 20)
    ctx.fillStyle = '#111'
    ctx.fillText(`${stat.displayCode}  x${stat.count}`, 40, y + 15)
  })
  return canvas.toDataURL('image/png')
}

async function exportSinglePagePdf(
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
  title: string,
  stats: ColorStat[],
): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const layout = getPatternLayout(grid, settings.cellSize, settings.showRuler)
  const patternData = await renderGridToDataUrl(grid, settings, codeLookup)

  const orientation = layout.width > layout.height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [layout.width, layout.height + PDF_HEADER] })
  pdf.setFontSize(14)
  pdf.text(title || 'Pindou 拼豆图纸', 12, 20)
  pdf.addImage(patternData, 'PNG', 0, PDF_HEADER, layout.width, layout.height)

  if (stats.length) {
    const statsImage = await renderStatsCanvas(stats)
    const statsHeight = Math.max(120, stats.length * 28 + 40)
    pdf.addPage([320, statsHeight + 40], orientation)
    pdf.setFontSize(14)
    pdf.text('采购清单', 12, 20)
    pdf.addImage(statsImage, 'PNG', 0, 28, 320, statsHeight)
  }

  return pdf.output('blob')
}

async function exportBoardsPdf(
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
  title: string,
  stats: ColorStat[],
): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const totalRows = grid.length
  const totalCols = grid[0]?.length ?? 0
  const boardRows = Math.ceil(totalRows / BOARD_SIZE)
  const boardCols = Math.ceil(totalCols / BOARD_SIZE)
  const totalPages = boardRows * boardCols

  const chunkSettings: ExportSettings = { ...settings, showBoardLines: false }
  const chunkLayout = getPatternLayout(
    sliceGrid(grid, 0, 0, BOARD_SIZE),
    chunkSettings.cellSize,
    chunkSettings.showRuler,
  )

  const orientation = chunkLayout.width > chunkLayout.height ? 'landscape' : 'portrait'
  const pageFormat: [number, number] = [chunkLayout.width, chunkLayout.height + PDF_HEADER + 16]
  const pdf = new jsPDF({ orientation, unit: 'px', format: pageFormat })

  let pageIndex = 0
  for (let br = 0; br < boardRows; br++) {
    for (let bc = 0; bc < boardCols; bc++) {
      if (pageIndex > 0) pdf.addPage(pageFormat, orientation)

      const chunk = sliceGrid(grid, br * BOARD_SIZE, bc * BOARD_SIZE, BOARD_SIZE)
      const patternData = await renderGridToDataUrl(chunk, chunkSettings, codeLookup)
      const label = boardLabel(bc, br)

      pdf.setFontSize(14)
      pdf.text(title || 'Pindou 拼豆图纸', 12, 18)
      pdf.setFontSize(11)
      pdf.text(`拼板 ${label}  ·  �?${pageIndex + 1} / ${totalPages} 页`, 12, 32)
      pdf.addImage(patternData, 'PNG', 0, PDF_HEADER + 16, chunkLayout.width, chunkLayout.height)

      pageIndex++
    }
  }

  if (stats.length) {
    const statsImage = await renderStatsCanvas(stats)
    const statsHeight = Math.max(120, stats.length * 28 + 40)
    pdf.addPage([320, statsHeight + 40], orientation)
    pdf.setFontSize(14)
    pdf.text('采购清单', 12, 20)
    pdf.addImage(statsImage, 'PNG', 0, 28, 320, statsHeight)
  }

  return pdf.output('blob')
}

export async function exportPatternPdf(
  grid: MappedGrid,
  settings: ExportSettings,
  codeLookup: (paletteId: string) => string,
  title: string,
  stats: ColorStat[],
): Promise<Blob | null> {
  if (settings.pdfLayout === 'boards') {
    return exportBoardsPdf(grid, settings, codeLookup, title, stats)
  }
  return exportSinglePagePdf(grid, settings, codeLookup, title, stats)
}
