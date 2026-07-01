import type { PaletteEntry } from '@wangdandan810012/bead-core'

const WHITE_HEXES = new Set(['#FFFFFF', '#FEFEFE', '#F5F5F5', '#F4F4F4', '#FAFAFA'])

function normalizeHex(hex: string): string {
  const compact = hex.replace(/[^0-9A-F]/gi, '').slice(0, 6)
  if (compact.length === 6) return `#${compact.toUpperCase()}`
  return '#E8E8E8'
}

function hexLuminance(hex: string): number {
  const n = parseInt(normalizeHex(hex).slice(1), 16)
  if (Number.isNaN(n)) return 0
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 解析用于背景剔除 / 橡皮的色�?ID 列表 */
export function resolveBackgroundPaletteIds(entries: PaletteEntry[]): string[] {
  if (!entries.length) return []

  const exactWhites = entries.filter((e) => WHITE_HEXES.has(normalizeHex(e.hex)))
  if (exactWhites.length) return [exactWhites[0].id]

  const neutrals = entries
    .filter((e) => /^neutral-00[0-2]$/i.test(e.id))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (neutrals.length) return [neutrals[0].id]

  const valid = entries.filter((e) => /^#[0-9A-F]{6}$/i.test(normalizeHex(e.hex)))
  if (valid.length) {
    const lightest = [...valid].sort((a, b) => hexLuminance(a.hex) - hexLuminance(b.hex))
    return [lightest[0].id]
  }

  return [entries[0].id]
}

export function resolveEraserEntry(
  activeEntries: PaletteEntry[],
  fullEntries: PaletteEntry[] = [],
): PaletteEntry | undefined {
  const ids = resolveBackgroundPaletteIds(activeEntries)
  const pools = [activeEntries, fullEntries]
  for (const id of ids) {
    for (const pool of pools) {
      const found = pool.find((e) => e.id === id)
      if (found) return found
    }
  }
  return activeEntries[0] ?? fullEntries[0]
}

export function eraserDisplayCode(
  entry: PaletteEntry | undefined,
  codeLookup: (id: string) => string,
): string {
  if (!entry) return '背景'
  const code = codeLookup(entry.id)
  return code && code !== '?' ? code : '背景'
}

export function normalizePaletteHex(hex: string): string {
  return normalizeHex(hex)
}
