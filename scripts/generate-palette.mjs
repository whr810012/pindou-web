/**
 * Generates a self-developed bead palette by sampling HSL color space.
 * Not copied from any third-party colorSystemMapping.json.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../src/static/palettes')

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

const BRANDS = ['MARD', 'COCO', 'MANMAN', 'PANPAN', 'MIXIAOWO']
const HUES = 24
const LIGHTNESS_LEVELS = [15, 28, 42, 58, 72, 88]
const SATURATION_LEVELS = [35, 55, 75, 92]

const entries = []
let index = 0

// Neutrals
for (const l of [96, 88, 78, 68, 58, 48, 38, 28, 18, 8]) {
  const hex = rgbToHex(l * 2.55, l * 2.55, l * 2.55)
  const id = `neutral-${String(index).padStart(3, '0')}`
  const code = `N${index + 1}`
  entries.push({
    id,
    hex,
    codes: Object.fromEntries(BRANDS.map((b) => [b, code])),
  })
  index++
}

// Chromatic grid
for (let hi = 0; hi < HUES; hi++) {
  const hue = Math.round((360 / HUES) * hi)
  for (const s of SATURATION_LEVELS) {
    for (const l of LIGHTNESS_LEVELS) {
      const { r, g, b } = hslToRgb(hue, s, l)
      const hex = rgbToHex(r, g, b)
      const id = `color-${String(index).padStart(3, '0')}`
      const letter = String.fromCharCode(65 + (hi % 26))
      const code = `${letter}${Math.floor(index / 26) + 1}`
      entries.push({
        id,
        hex,
        codes: Object.fromEntries(BRANDS.map((b, bi) => [b, `${code}${bi === 0 ? '' : '-' + b[0]}`])),
      })
      index++
    }
  }
}

mkdirSync(outDir, { recursive: true })

const full = {
  id: 'pindou-full',
  name: 'Pindou 全色系',
  count: entries.length,
  entries,
}

const subset168 = {
  id: 'pindou-168',
  name: 'Pindou 168色',
  count: 168,
  entryIds: entries.filter((_, i) => i % Math.ceil(entries.length / 168) === 0)
    .slice(0, 168)
    .map((e) => e.id),
}

const subset96 = {
  id: 'pindou-96',
  name: 'Pindou 96色',
  count: 96,
  entryIds: entries.filter((_, i) => i % Math.ceil(entries.length / 96) === 0)
    .slice(0, 96)
    .map((e) => e.id),
}

writeFileSync(join(outDir, 'full.json'), JSON.stringify(full, null, 2))
writeFileSync(join(outDir, 'subset-168.json'), JSON.stringify(subset168, null, 2))
writeFileSync(join(outDir, 'subset-96.json'), JSON.stringify(subset96, null, 2))

console.log(`Generated ${entries.length} palette entries`)
