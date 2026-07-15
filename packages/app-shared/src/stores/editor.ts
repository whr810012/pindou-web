import { defineStore } from 'pinia'
import type { MappedGrid } from '@wangdandan810012/bead-core'
import { cloneGrid } from '@wangdandan810012/bead-core'
import type { EditorTool } from '../types/app.js'

interface HistoryEntry {
  grid: MappedGrid
  at: number
  label?: string
}

interface EditorState {
  tool: EditorTool
  selectedPaletteId: string
  selectedHex: string
  replaceFromId: string
  history: HistoryEntry[]
  future: HistoryEntry[]
  strokeOpen: boolean
}

const MAX_HISTORY = 40

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    tool: 'brush',
    selectedPaletteId: '',
    selectedHex: '#000000',
    replaceFromId: '',
    history: [],
    future: [],
    strokeOpen: false,
  }),
  getters: {
    canUndo: (state) => state.history.length > 0,
    canRedo: (state) => state.future.length > 0,
    historySteps(state) {
      return state.history.map((entry, index) => ({
        index,
        at: entry.at,
        label: entry.label || `步骤 ${index + 1}`,
      }))
    },
    snapshotCount(state) {
      return state.history.length + 1
    },
  },
  actions: {
    setTool(tool: EditorTool) {
      this.endStroke()
      this.tool = tool
    },
    selectColor(paletteId: string, hex: string) {
      this.selectedPaletteId = paletteId
      this.selectedHex = hex
    },
    beginStroke(grid: MappedGrid, label = '画笔') {
      if (this.strokeOpen) return
      this.pushHistory(grid, label)
      this.strokeOpen = true
    },
    endStroke() {
      this.strokeOpen = false
    },
    pushHistory(grid: MappedGrid, label?: string) {
      this.history.push({ grid: cloneGrid(grid), at: Date.now(), label })
      if (this.history.length > MAX_HISTORY) this.history.shift()
      this.future = []
    },
    undo(current: MappedGrid): MappedGrid | null {
      this.endStroke()
      if (this.history.length === 0) return null
      this.future.push({ grid: cloneGrid(current), at: Date.now() })
      const prev = this.history.pop()!
      return cloneGrid(prev.grid)
    },
    redo(current: MappedGrid): MappedGrid | null {
      this.endStroke()
      if (this.future.length === 0) return null
      this.history.push({ grid: cloneGrid(current), at: Date.now() })
      const next = this.future.pop()!
      return cloneGrid(next.grid)
    },
    jumpToSnapshot(index: number, current: MappedGrid): MappedGrid | null {
      this.endStroke()
      const snapshots = [
        ...this.history.map((h) => ({ grid: cloneGrid(h.grid), label: h.label })),
        { grid: cloneGrid(current), label: undefined as string | undefined },
      ]
      if (index < 0 || index >= snapshots.length) return null
      const target = snapshots[index]
      this.future = snapshots.slice(index + 1).map((item) => ({
        grid: cloneGrid(item.grid),
        at: Date.now(),
        label: item.label,
      }))
      this.history = snapshots.slice(0, index).map((item) => ({
        grid: cloneGrid(item.grid),
        at: Date.now(),
        label: item.label,
      }))
      return cloneGrid(target.grid)
    },
    resetHistory() {
      this.history = []
      this.future = []
      this.strokeOpen = false
    },
  },
})
