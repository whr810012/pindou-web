import { defineStore } from 'pinia'
import type { BrandSystem, PaletteEntry } from '@pindou/bead-core'
import { getPlatform } from '../platform/context.js'
import type { CustomPalette, PaletteBundle, PalettePreset } from '../types/app.js'
import {
  createCustomEntryId,
  createCustomPaletteId,
  loadCustomPalettes,
  saveCustomPalettes,
} from '../utils/customPaletteStorage.js'
import { resolveBackgroundPaletteIds } from '../utils/backgroundPalette.js'

interface PaletteState {
  fullEntries: PaletteEntry[]
  presets: PalettePreset[]
  customPalettes: CustomPalette[]
  brand: BrandSystem
  activePresetId: string
  loaded: boolean
}

export const usePaletteStore = defineStore('palette', {
  state: (): PaletteState => ({
    fullEntries: [],
    presets: [],
    customPalettes: [],
    brand: 'MARD',
    activePresetId: 'pindou-full',
    loaded: false,
  }),
  getters: {
    allPresets(state): PalettePreset[] {
      const custom = state.customPalettes.map((p) => ({
        id: p.id,
        name: p.name,
        count: p.entries.length,
        entries: p.entries,
      }))
      return [...state.presets, ...custom]
    },
    activeEntries(state): PaletteEntry[] {
      const preset = this.allPresets.find((p) => p.id === state.activePresetId)
      if (!preset) return state.fullEntries
      if (preset.entries) return preset.entries
      if (preset.entryIds) {
        const map = new Map(state.fullEntries.map((e) => [e.id, e]))
        return preset.entryIds.map((id) => map.get(id)).filter(Boolean) as PaletteEntry[]
      }
      return state.fullEntries
    },
    activeCustomPalette(state): CustomPalette | undefined {
      return state.customPalettes.find((p) => p.id === state.activePresetId)
    },
    backgroundIds(): string[] {
      return resolveBackgroundPaletteIds(this.activeEntries)
    },
  },
  actions: {
    async loadPalettes() {
      if (this.loaded) {
        this.customPalettes = loadCustomPalettes()
        return
      }
      const http = getPlatform().http
      const [full, subset168, subset96] = await Promise.all([
        http.fetchJson<PaletteBundle>('/static/palettes/full.json'),
        http.fetchJson<PalettePreset>('/static/palettes/subset-168.json'),
        http.fetchJson<PalettePreset>('/static/palettes/subset-96.json'),
      ])
      this.fullEntries = full.entries
      this.presets = [
        { id: full.id, name: full.name, count: full.count, entries: full.entries },
        subset168,
        subset96,
      ]
      this.customPalettes = loadCustomPalettes()
      this.loaded = true
    },
    persistCustomPalettes() {
      saveCustomPalettes(this.customPalettes)
    },
    setBrand(brand: BrandSystem) {
      this.brand = brand
    },
    setPreset(id: string) {
      this.activePresetId = id
    },
    createCustomPalette(name: string) {
      const palette: CustomPalette = {
        id: createCustomPaletteId(),
        name,
        entries: [],
        updatedAt: Date.now(),
      }
      this.customPalettes.unshift(palette)
      this.persistCustomPalettes()
      this.activePresetId = palette.id
      return palette.id
    },
    deleteCustomPalette(id: string) {
      this.customPalettes = this.customPalettes.filter((p) => p.id !== id)
      this.persistCustomPalettes()
      if (this.activePresetId === id) {
        this.activePresetId = 'pindou-168'
      }
    },
    renameCustomPalette(id: string, name: string) {
      const palette = this.customPalettes.find((p) => p.id === id)
      if (!palette) return
      palette.name = name
      palette.updatedAt = Date.now()
      this.persistCustomPalettes()
    },
    addCustomEntry(paletteId: string, hex: string, code: string) {
      const palette = this.customPalettes.find((p) => p.id === paletteId)
      if (!palette) return
      const entry: PaletteEntry = {
        id: createCustomEntryId(),
        hex: hex.toUpperCase(),
        codes: {
          MARD: code,
          COCO: code,
          MANMAN: code,
          PANPAN: code,
          MIXIAOWO: code,
        },
      }
      palette.entries.push(entry)
      palette.updatedAt = Date.now()
      this.persistCustomPalettes()
    },
    removeCustomEntry(paletteId: string, entryId: string) {
      const palette = this.customPalettes.find((p) => p.id === paletteId)
      if (!palette) return
      palette.entries = palette.entries.filter((e) => e.id !== entryId)
      palette.updatedAt = Date.now()
      this.persistCustomPalettes()
    },
    importCustomEntries(paletteId: string, entries: PaletteEntry[], mode: 'append' | 'replace' = 'append') {
      const palette = this.customPalettes.find((p) => p.id === paletteId)
      if (!palette) return
      palette.entries = mode === 'replace' ? entries : [...palette.entries, ...entries]
      palette.updatedAt = Date.now()
      this.persistCustomPalettes()
    },
    importSharedPalette(
      name: string,
      entries: PaletteEntry[],
      mode: 'new' | 'append',
      targetPaletteId?: string,
    ): string {
      if (mode === 'new') {
        const palette: CustomPalette = {
          id: createCustomPaletteId(),
          name,
          entries: [...entries],
          updatedAt: Date.now(),
        }
        this.customPalettes.unshift(palette)
        this.activePresetId = palette.id
        this.persistCustomPalettes()
        return palette.id
      }
      if (targetPaletteId) {
        this.importCustomEntries(targetPaletteId, entries, 'append')
        return targetPaletteId
      }
      return this.activePresetId
    },
    getDisplayCode(paletteId: string): string {
      const entry =
        this.activeEntries.find((e) => e.id === paletteId) ??
        this.fullEntries.find((e) => e.id === paletteId)
      return entry?.codes[this.brand] ?? '?'
    },
    findEntry(paletteId: string): PaletteEntry | undefined {
      return (
        this.activeEntries.find((e) => e.id === paletteId) ??
        this.fullEntries.find((e) => e.id === paletteId)
      )
    },
  },
})
