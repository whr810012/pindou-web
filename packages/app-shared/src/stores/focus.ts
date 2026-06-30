import { defineStore } from 'pinia'
import type { MappedGrid } from '@wangdandan810012/bead-core'
import { countCompleted, countTotalBeads } from '@wangdandan810012/bead-core'
import {
  getZoneBounds,
  isCellInZone,
  zoneProgress,
  type ZoneSplit,
} from '../utils/focusZones.js'

interface FocusState {
  completedCells: Set<string>
  highlightPaletteId: string | null
  magnifierEnabled: boolean
  zoneEnabled: boolean
  zoneSplit: ZoneSplit
  activeZoneRow: number
  activeZoneCol: number
}

export const useFocusStore = defineStore('focus', {
  state: (): FocusState => ({
    completedCells: new Set<string>(),
    highlightPaletteId: null,
    magnifierEnabled: false,
    zoneEnabled: false,
    zoneSplit: { rows: 2, cols: 2 },
    activeZoneRow: 0,
    activeZoneCol: 0,
  }),
  getters: {
    activeZoneBounds(state) {
      return (grid: MappedGrid | null) => {
        if (!grid) return null
        return getZoneBounds(grid, state.activeZoneRow, state.activeZoneCol, state.zoneSplit)
      }
    },
    progress(state) {
      return (grid: MappedGrid | null) => {
        if (!grid) return { done: 0, total: 0, percent: 0 }
        if (state.zoneEnabled) {
          const bounds = getZoneBounds(
            grid,
            state.activeZoneRow,
            state.activeZoneCol,
            state.zoneSplit,
          )
          return zoneProgress(grid, bounds, state.completedCells)
        }
        const total = countTotalBeads(grid)
        const done = countCompleted(grid, state.completedCells)
        return {
          done,
          total,
          percent: total === 0 ? 0 : Math.round((done / total) * 100),
        }
      }
    },
    totalProgress(state) {
      return (grid: MappedGrid | null) => {
        if (!grid) return { done: 0, total: 0, percent: 0 }
        const total = countTotalBeads(grid)
        const done = countCompleted(grid, state.completedCells)
        return {
          done,
          total,
          percent: total === 0 ? 0 : Math.round((done / total) * 100),
        }
      }
    },
    isZoneCellActive(state) {
      return (grid: MappedGrid | null, row: number, col: number) => {
        if (!state.zoneEnabled || !grid) return true
        const bounds = getZoneBounds(
          grid,
          state.activeZoneRow,
          state.activeZoneCol,
          state.zoneSplit,
        )
        return isCellInZone(row, col, bounds)
      }
    },
    paletteProgressMap(state) {
      return (grid: MappedGrid | null): Map<string, { done: number; total: number }> => {
        const map = new Map<string, { done: number; total: number }>()
        if (!grid) return map
        const bounds = state.zoneEnabled
          ? getZoneBounds(grid, state.activeZoneRow, state.activeZoneCol, state.zoneSplit)
          : null
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
            const cell = grid[row][col]
            if (cell.isExternal) continue
            if (bounds && !isCellInZone(row, col, bounds)) continue
            let entry = map.get(cell.paletteId)
            if (!entry) {
              entry = { done: 0, total: 0 }
              map.set(cell.paletteId, entry)
            }
            entry.total++
            if (state.completedCells.has(`${row},${col}`)) entry.done++
          }
        }
        return map
      }
    },
  },
  actions: {
    toggleCell(row: number, col: number) {
      const key = `${row},${col}`
      const next = new Set(this.completedCells)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      this.completedCells = next
    },
    setHighlight(paletteId: string | null) {
      this.highlightPaletteId = paletteId
    },
    toggleMagnifier() {
      this.magnifierEnabled = !this.magnifierEnabled
    },
    toggleZoneMode() {
      this.zoneEnabled = !this.zoneEnabled
    },
    setZoneSplit(split: ZoneSplit) {
      this.zoneSplit = { ...split }
      this.activeZoneRow = 0
      this.activeZoneCol = 0
    },
    setActiveZone(zoneRow: number, zoneCol: number) {
      this.activeZoneRow = zoneRow
      this.activeZoneCol = zoneCol
    },
    nextZone() {
      const maxCol = this.zoneSplit.cols - 1
      const maxRow = this.zoneSplit.rows - 1
      if (this.activeZoneCol < maxCol) {
        this.activeZoneCol++
        return
      }
      if (this.activeZoneRow < maxRow) {
        this.activeZoneRow++
        this.activeZoneCol = 0
      }
    },
    loadCompleted(keys: string[]) {
      this.completedCells = new Set(keys)
    },
    markPaletteComplete(grid: MappedGrid, paletteId: string) {
      const next = new Set(this.completedCells)
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
          const cell = grid[row][col]
          if (cell.isExternal || cell.paletteId !== paletteId) continue
          if (this.zoneEnabled && !this.isZoneCellActive(grid, row, col)) continue
          next.add(`${row},${col}`)
        }
      }
      this.completedCells = next
    },
    unmarkPaletteComplete(grid: MappedGrid, paletteId: string) {
      const next = new Set(this.completedCells)
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
          const cell = grid[row][col]
          if (cell.isExternal || cell.paletteId !== paletteId) continue
          if (this.zoneEnabled && !this.isZoneCellActive(grid, row, col)) continue
          next.delete(`${row},${col}`)
        }
      }
      this.completedCells = next
    },
    paletteCompletionCount(grid: MappedGrid | null, paletteId: string) {
      if (!grid) return { done: 0, total: 0 }
      let total = 0
      let done = 0
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
          const cell = grid[row][col]
          if (cell.isExternal || cell.paletteId !== paletteId) continue
          if (this.zoneEnabled && !this.isZoneCellActive(grid, row, col)) continue
          total++
          if (this.completedCells.has(`${row},${col}`)) done++
        }
      }
      return { done, total }
    },
    reset() {
      this.completedCells = new Set()
      this.highlightPaletteId = null
      this.magnifierEnabled = false
      this.zoneEnabled = false
      this.zoneSplit = { rows: 2, cols: 2 }
      this.activeZoneRow = 0
      this.activeZoneCol = 0
    },
    exportCompleted(): string[] {
      return Array.from(this.completedCells)
    },
  },
})
