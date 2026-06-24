import type { PaletteEntry, Rgb } from '../types.js'
import { colorDistance, hexToRgb } from './oklab.js'

export function findClosestPaletteEntry(target: Rgb, palette: PaletteEntry[]): PaletteEntry {
  if (palette.length === 0) {
    throw new Error('Palette must not be empty')
  }

  let minDistance = Infinity
  let closest = palette[0]

  for (const entry of palette) {
    const rgb = hexToRgb(entry.hex)
    if (!rgb) continue
    const distance = colorDistance(target, rgb)
    if (distance < minDistance) {
      minDistance = distance
      closest = entry
      if (distance === 0) break
    }
  }

  return closest
}

export function filterActivePalette(
  palette: PaletteEntry[],
  excludedIds: Set<string>,
): PaletteEntry[] {
  return palette.filter((entry) => !excludedIds.has(entry.id))
}
