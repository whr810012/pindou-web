import type { MappedGrid } from '@wangdandan810012/bead-core'

export interface LoadedImage {
  path: string
  width: number
  height: number
  pixels: Uint8ClampedArray
}

export interface RenderGridOptions {
  cellSize: number
  showGrid?: boolean
  highlightPaletteId?: string | null
  completedCells?: Set<string>
  brandCodeLookup?: (paletteId: string) => string
  showColorCode?: boolean
  isZoneActive?: (row: number, col: number) => boolean
  layoutWidth?: number
  /** 空白格仅填色、不画斜纹（大图性能优化�?*/
  simpleExternal?: boolean
}

export interface ImageDataAdapter {
  loadFromPath(path: string, maxEdge?: number): Promise<LoadedImage>
  renderGrid(
    canvas: HTMLCanvasElement,
    grid: MappedGrid,
    options: RenderGridOptions,
  ): void
  exportCanvas(canvas: HTMLCanvasElement): string
}

export const MAX_IMAGE_EDGE = 4096
export const MAX_GRID_WIDTH = 256

export function getSafeDpr(): number {
  return Math.min(window.devicePixelRatio ?? 1, 3)
}
