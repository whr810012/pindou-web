import type { BrandSystem, PaletteEntry } from '@wangdandan810012/bead-core'
import { getPlatform } from '../platform/context.js'
import { createCustomEntryId } from './customPaletteStorage.js'

const SHARE_PREFIX = 'pindou-palette-v1:'

interface SharePayload {
  v: number
  name: string
  entries: Array<{ h: string; c: Record<BrandSystem, string> }>
}

export function encodePaletteShare(name: string, entries: PaletteEntry[]): string {
  const payload: SharePayload = {
    v: 1,
    name,
    entries: entries.map((e) => ({ h: e.hex, c: { ...e.codes } })),
  }
  return SHARE_PREFIX + getPlatform().codec.toBase64(JSON.stringify(payload))
}

export function decodePaletteShare(text: string): { name: string; entries: PaletteEntry[] } {
  const raw = text.trim()
  if (!raw.startsWith(SHARE_PREFIX)) {
    throw new Error('无效的色板分享砝')
  }
  const payload = JSON.parse(
    getPlatform().codec.fromBase64(raw.slice(SHARE_PREFIX.length)),
  ) as SharePayload
  if (!payload.entries?.length) {
    throw new Error('分享砝中无色坷数杮')
  }
  const entries: PaletteEntry[] = payload.entries.map((row) => ({
    id: createCustomEntryId(),
    hex: row.h.toUpperCase(),
    codes: { ...row.c },
  }))
  return { name: payload.name || '导入色板', entries }
}

export function extractEntriesFromGrid(
  grid: import('@wangdandan810012/bead-core').MappedGrid,
  lookup: (id: string) => PaletteEntry | undefined,
): PaletteEntry[] {
  const map = new Map<string, PaletteEntry>()
  for (const row of grid) {
    for (const cell of row) {
      if (cell.isExternal || map.has(cell.paletteId)) continue
      const entry = lookup(cell.paletteId)
      map.set(
        cell.paletteId,
        entry
          ? { ...entry, id: createCustomEntryId() }
          : {
              id: createCustomEntryId(),
              hex: cell.hex,
              codes: {
                MARD: '?',
                COCO: '?',
                MANMAN: '?',
                PANPAN: '?',
                MIXIAOWO: '?',
              },
            },
      )
    }
  }
  return Array.from(map.values())
}
