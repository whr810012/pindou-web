/**
 * 为画廊案例生成可编辑的完整项目 JSON（含 grid）。
 * 用法：npm run build:packages && node scripts/generate-gallery-projects.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runPipeline } from '../packages/bead-core/dist/pipeline/runPipeline.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const galleryDir = join(root, 'public', 'static', 'gallery')
const projectsDir = join(galleryDir, 'projects')
const galleryJsonPath = join(galleryDir, 'gallery.json')

const PALETTE_FILES = {
  'pindou-full': 'full.json',
  'pindou-168': 'subset-168.json',
  'pindou-96': 'subset-96.json',
}

function resolveBackgroundPaletteIds(entries) {
  const whiteHexes = new Set(['#FFFFFF', '#FEFEFE', '#F5F5F5', '#F4F4F4', '#FAFAFA'])
  const normalizeHex = (hex) => {
    const compact = hex.replace(/[^0-9A-F]/gi, '').slice(0, 6)
    return compact.length === 6 ? `#${compact.toUpperCase()}` : '#E8E8E8'
  }
  const exactWhites = entries.filter((e) => whiteHexes.has(normalizeHex(e.hex)))
  if (exactWhites.length) return exactWhites.slice(0, 3).map((e) => e.id)
  const neutrals = entries
    .filter((e) => /^neutral-00[0-2]$/i.test(e.id))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (neutrals.length) return neutrals.map((e) => e.id)
  return entries.length ? [entries[0].id] : []
}

function toImageDataUrl(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const buf = readFileSync(filePath)
  if (ext === 'svg') {
    return `data:image/svg+xml;base64,${buf.toString('base64')}`
  }
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
  return `data:${mime};base64,${buf.toString('base64')}`
}

async function loadPixels(dataUrl) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0"><img id="src" src="${dataUrl}" /></body></html>`,
    { waitUntil: 'load' },
  )
  const result = await page.evaluate(async () => {
    const img = document.getElementById('src')
    if (!(img instanceof HTMLImageElement)) throw new Error('image missing')
    if (!img.complete) {
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
    }
    const maxEdge = 640
    let w = img.naturalWidth || img.width
    let h = img.naturalHeight || img.height
    const max = Math.max(w, h)
    if (max > maxEdge) {
      const ratio = maxEdge / max
      w = Math.max(1, Math.round(w * ratio))
      h = Math.max(1, Math.round(h * ratio))
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    return { pixels: Array.from(data), width: w, height: h }
  })
  await browser.close()
  return result
}

function loadPaletteEntries(presetId) {
  const file = PALETTE_FILES[presetId] ?? 'full.json'
  const palette = JSON.parse(
    readFileSync(join(root, 'public', 'static', 'palettes', file), 'utf8'),
  )
  if (palette.entries?.length) return palette.entries
  const full = JSON.parse(
    readFileSync(join(root, 'public', 'static', 'palettes', 'full.json'), 'utf8'),
  )
  const byId = new Map((full.entries ?? []).map((e) => [e.id, e]))
  return (palette.entryIds ?? []).map((id) => byId.get(id)).filter(Boolean)
}

async function buildProjectForItem(item) {
  const imagePath = join(galleryDir, `${item.id.replace('demo-', 'demo-')}.svg`)
  const svgName = item.thumbnail?.split('/').pop()
  const resolvedPath = svgName ? join(galleryDir, svgName) : imagePath
  if (!existsSync(resolvedPath)) {
    console.warn('[gallery-projects] skip missing image:', resolvedPath)
    return null
  }

  const entries = loadPaletteEntries(item.palettePresetId)
  const backgroundPaletteIds = resolveBackgroundPaletteIds(entries)
  const dataUrl = toImageDataUrl(resolvedPath)
  const { pixels: pixelArr, width, height } = await loadPixels(dataUrl)
  const pixels = new Uint8ClampedArray(pixelArr)

  const { grid } = runPipeline(pixels, width, height, {
    gridWidth: item.gridWidth,
    mode: item.mode,
    mergeThreshold: item.mergeThreshold ?? 8,
    maxColors: item.maxColors ?? 0,
    backgroundPaletteIds,
    excludedPaletteIds: [],
    palette: entries,
  })

  return {
    version: 1,
    name: item.title,
    params: {
      gridWidth: item.gridWidth,
      mode: item.mode,
      mergeThreshold: item.mergeThreshold ?? 8,
      maxColors: item.maxColors ?? 0,
      palettePresetId: item.palettePresetId,
      brand: 'MARD',
      imageAdjust: { brightness: 0, contrast: 0, saturation: 0 },
      photoOptimize: { denoise: false, sharpen: false },
    },
    grid,
    excludedPaletteIds: [],
    completedCells: [],
    sourcePreview: item.thumbnail,
  }
}

async function main() {
  if (!existsSync(galleryJsonPath)) {
    console.error('[gallery-projects] missing gallery.json')
    process.exit(1)
  }

  mkdirSync(projectsDir, { recursive: true })
  const gallery = JSON.parse(readFileSync(galleryJsonPath, 'utf8'))

  for (const item of gallery.items) {
    console.log('[gallery-projects] generating', item.id)
    const project = await buildProjectForItem(item)
    if (!project) continue
    const outPath = join(projectsDir, `${item.id}.json`)
    writeFileSync(outPath, `${JSON.stringify(project)}\n`, 'utf8')
    item.projectFile = `/static/gallery/projects/${item.id}.json`
    console.log('[gallery-projects] wrote', outPath)
  }

  writeFileSync(galleryJsonPath, `${JSON.stringify(gallery, null, 2)}\n`, 'utf8')
  console.log('[gallery-projects] updated gallery.json')
}

main().catch((error) => {
  console.error('[gallery-projects] failed:', error)
  process.exit(1)
})
