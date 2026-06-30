import type { MappedGrid } from '@wangdandan810012/bead-core'

export interface ZoneSplit {
  rows: number
  cols: number
}

export interface ZoneBounds {
  row0: number
  col0: number
  row1: number
  col1: number
}

export function getZoneBounds(
  grid: MappedGrid,
  zoneRow: number,
  zoneCol: number,
  split: ZoneSplit,
): ZoneBounds {
  const gridRows = grid.length
  const gridCols = grid[0]?.length ?? 0
  const zoneHeight = Math.ceil(gridRows / split.rows)
  const zoneWidth = Math.ceil(gridCols / split.cols)

  return {
    row0: zoneRow * zoneHeight,
    col0: zoneCol * zoneWidth,
    row1: Math.min(gridRows - 1, (zoneRow + 1) * zoneHeight - 1),
    col1: Math.min(gridCols - 1, (zoneCol + 1) * zoneWidth - 1),
  }
}

export function isCellInZone(row: number, col: number, bounds: ZoneBounds): boolean {
  return row >= bounds.row0 && row <= bounds.row1 && col >= bounds.col0 && col <= bounds.col1
}

export function zoneProgress(
  grid: MappedGrid,
  bounds: ZoneBounds,
  completedCells: Set<string>,
): { done: number; total: number; percent: number } {
  let total = 0
  let done = 0
  for (let row = bounds.row0; row <= bounds.row1; row++) {
    for (let col = bounds.col0; col <= bounds.col1; col++) {
      const cell = grid[row]?.[col]
      if (!cell || cell.isExternal) continue
      total++
      if (completedCells.has(`${row},${col}`)) done++
    }
  }
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export const ZONE_SPLIT_OPTIONS: ZoneSplit[] = [
  { rows: 1, cols: 2 },
  { rows: 2, cols: 1 },
  { rows: 2, cols: 2 },
  { rows: 3, cols: 3 },
]

export function zoneLabel(split: ZoneSplit, zoneRow: number, zoneCol: number): string {
  const index = zoneRow * split.cols + zoneCol + 1
  const total = split.rows * split.cols
  return `分区 ${index}/${total}`
}
