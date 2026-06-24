import { defineStore } from 'pinia'
import type { MappedGrid } from '@pindou/bead-core'
import { cloneGrid } from '@pindou/bead-core'
import type { ProjectParams } from '../types/app.js'
import { DEFAULT_PARAMS } from '../types/app.js'

interface ProjectState {
  sourcePath: string
  sourceWidth: number
  sourceHeight: number
  sourcePixels: Uint8ClampedArray | null
  sourcePreview: string
  grid: MappedGrid | null
  params: ProjectParams
  excludedPaletteIds: string[]
  dirty: boolean
  projectName: string
  savedProjectId: string | null
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    sourcePath: '',
    sourceWidth: 0,
    sourceHeight: 0,
    sourcePixels: null,
    sourcePreview: '',
    grid: null,
    params: { ...DEFAULT_PARAMS },
    excludedPaletteIds: [],
    dirty: false,
    projectName: '未命名项目',
    savedProjectId: null,
  }),
  getters: {
    hasGrid: (state) => !!state.grid && state.grid.length > 0,
    gridSize: (state) => ({
      width: state.grid?.[0]?.length ?? 0,
      height: state.grid?.length ?? 0,
    }),
  },
  actions: {
    setSource(path: string, width: number, height: number, pixels: Uint8ClampedArray) {
      this.sourcePath = path
      this.sourceWidth = width
      this.sourceHeight = height
      this.sourcePixels = pixels
      this.savedProjectId = null
      this.dirty = true
    },
    setSourcePreview(preview: string) {
      this.sourcePreview = preview
    },
    setGrid(grid: MappedGrid) {
      this.grid = cloneGrid(grid)
      this.dirty = true
    },
    updateCell(row: number, col: number, paletteId: string, hex: string) {
      if (!this.grid?.[row]?.[col]) return
      this.grid[row][col] = { paletteId, hex, isExternal: false }
      this.dirty = true
    },
    eraseCell(row: number, col: number, paletteId: string, hex: string) {
      if (!this.grid?.[row]?.[col]) return
      this.grid[row][col] = { paletteId, hex, isExternal: true }
      this.dirty = true
    },
    setParams(params: Partial<ProjectParams>) {
      this.params = { ...this.params, ...params }
      this.dirty = true
    },
    toggleExcluded(paletteId: string) {
      const set = new Set(this.excludedPaletteIds)
      if (set.has(paletteId)) set.delete(paletteId)
      else set.add(paletteId)
      this.excludedPaletteIds = Array.from(set)
      this.dirty = true
    },
    restoreAllExcluded() {
      this.excludedPaletteIds = []
      this.dirty = true
    },
    loadSnapshot(data: {
      grid: MappedGrid
      params: ProjectParams
      excludedPaletteIds: string[]
      projectName?: string
      sourcePath?: string
      sourcePreview?: string
      savedProjectId?: string | null
    }) {
      this.grid = cloneGrid(data.grid)
      this.params = { ...data.params }
      this.excludedPaletteIds = [...data.excludedPaletteIds]
      this.projectName = data.projectName ?? '未命名项目'
      this.sourcePath = data.sourcePath ?? ''
      this.sourcePreview = data.sourcePreview ?? ''
      this.savedProjectId = data.savedProjectId ?? null
      this.sourcePixels = null
      this.dirty = false
    },
    reset() {
      this.$reset()
    },
  },
})
