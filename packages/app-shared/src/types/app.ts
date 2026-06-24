import type { BrandSystem, PaletteEntry, PixelationMode } from '@pindou/bead-core'

export interface PalettePreset {
  id: string
  name: string
  count: number
  entryIds?: string[]
  entries?: PaletteEntry[]
}

export interface PaletteBundle {
  id: string
  name: string
  count: number
  entries: PaletteEntry[]
}

export interface CustomPalette {
  id: string
  name: string
  entries: PaletteEntry[]
  updatedAt: number
}

export interface ProjectParams {
  gridWidth: number
  mode: PixelationMode
  mergeThreshold: number
  palettePresetId: string
  brand: BrandSystem
}

export interface SavedProject {
  id: string
  name: string
  updatedAt: number
  thumbnail?: string
  sourcePreview?: string
  params: ProjectParams
  grid: import('@pindou/bead-core').MappedGrid
  excludedPaletteIds: string[]
  completedCells: string[]
}

export interface ParamPreset {
  id: string
  name: string
  params: ProjectParams
  brand: BrandSystem
  updatedAt: number
}

export type EditorTool = 'brush' | 'fill' | 'eraser' | 'picker' | 'replace' | 'rect'

export type ExportFormat = 'png' | 'pdf' | 'all'

export interface ExportSettings {
  format: ExportFormat
  showGrid: boolean
  showCoordinates: boolean
  showRuler: boolean
  showColorCode: boolean
  cellSize: number
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'all',
  showGrid: true,
  showCoordinates: false,
  showRuler: true,
  showColorCode: true,
  cellSize: 16,
}

export const DEFAULT_PARAMS: ProjectParams = {
  gridWidth: 72,
  mode: 'average',
  mergeThreshold: 8,
  palettePresetId: 'pindou-full',
  brand: 'MARD',
}

export const BRAND_OPTIONS: Array<{ label: string; value: BrandSystem }> = [
  { label: 'MARD', value: 'MARD' },
  { label: 'COCO', value: 'COCO' },
  { label: '漫漫', value: 'MANMAN' },
  { label: '盼盼', value: 'PANPAN' },
  { label: '咪小窝', value: 'MIXIAOWO' },
]

export const PALETTE_PRESET_OPTIONS = [
  { label: '全色系', value: 'pindou-full' },
  { label: '168 色', value: 'pindou-168' },
  { label: '96 色', value: 'pindou-96' },
]

export const MODE_OPTIONS = [
  { label: '卡通（主导色）', value: 'dominant' },
  { label: '真实（平均色）', value: 'average' },
]
