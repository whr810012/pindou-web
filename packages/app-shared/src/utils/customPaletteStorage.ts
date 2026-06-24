import type { BrandSystem, PaletteEntry } from '@pindou/bead-core'
import { getPlatform } from '../platform/context.js'
import type { CustomPalette } from '../types/app.js'

const STORAGE_KEY = 'pindou-custom-palettes'

export function loadCustomPalettes(): CustomPalette[] {
  try {
    const raw = getPlatform().storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomPalettes(palettes: CustomPalette[]) {
  getPlatform().storage.setItem(STORAGE_KEY, JSON.stringify(palettes))
}

export function createCustomPaletteId(): string {
  return `custom-${Date.now().toString(36)}`
}

export function createCustomEntryId(): string {
  return `custom-entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(h)) {
    throw new Error(`无效颜色: ${hex}`)
  }
  return `#${h.toUpperCase()}`
}

function emptyCodes(code: string): Record<BrandSystem, string> {
  return {
    MARD: code,
    COCO: code,
    MANMAN: code,
    PANPAN: code,
    MIXIAOWO: code,
  }
}

export function parsePaletteImport(text: string, brand: BrandSystem): PaletteEntry[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const json = JSON.parse(trimmed) as unknown
    const rows = Array.isArray(json)
      ? json
      : (json as { entries?: unknown[] }).entries ?? []
    return rows.map((row, index) => parseJsonRow(row, brand, index))
  }

  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('#'))
  return lines.map((line, index) => parseCsvLine(line, brand, index))
}

function parseJsonRow(row: unknown, brand: BrandSystem, index: number): PaletteEntry {
  if (typeof row !== 'object' || row === null) {
    throw new Error(`第 ${index + 1} 行格式无效`)
  }
  const obj = row as Record<string, string>
  const hex = normalizeHex(obj.hex ?? obj.color ?? obj.colour ?? '')
  const codes = { ...emptyCodes(obj[brand] ?? obj.code ?? `C${index + 1}`) }
  for (const key of ['MARD', 'COCO', 'MANMAN', 'PANPAN', 'MIXIAOWO'] as BrandSystem[]) {
    if (obj[key]) codes[key] = String(obj[key])
  }
  return {
    id: obj.id ?? createCustomEntryId(),
    hex,
    codes,
  }
}

function parseCsvLine(line: string, brand: BrandSystem, index: number): PaletteEntry {
  const parts = line.split(/[,;\t]/).map((p) => p.trim())
  if (parts.length < 2) {
    throw new Error(`第 ${index + 1} 行需包含色号与颜色，例如 R1,#FF0000`)
  }
  const [a, b] = parts
  const aIsHex = a.startsWith('#') || /^[0-9A-Fa-f]{3,6}$/.test(a)
  const hex = normalizeHex(aIsHex ? a : b)
  const code = aIsHex ? b : a
  return {
    id: createCustomEntryId(),
    hex,
    codes: emptyCodes(code || `C${index + 1}`),
  }
}

export function exportPaletteJson(entries: PaletteEntry[]): string {
  return JSON.stringify(
    {
      name: 'Pindou 自定义色板',
      count: entries.length,
      entries,
    },
    null,
    2,
  )
}

export function exportPaletteCsv(entries: PaletteEntry[], brand: BrandSystem): string {
  const header = 'code,hex'
  const rows = entries.map((e) => `${e.codes[brand]},${e.hex}`)
  return [header, ...rows].join('\n')
}
