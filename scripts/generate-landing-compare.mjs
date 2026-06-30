import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runPipeline } from '@wangdandan810012/bead-core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const galleryDir = join(root, 'public', 'static', 'gallery')
const sourcePath = join(galleryDir, 'landing-compare-source.png')
const beforeOut = join(galleryDir, 'landing-compare-before.jpg')
const afterOut = join(galleryDir, 'landing-compare-after.png')
const metaOut = join(galleryDir, 'landing-compare-meta.json')

const DEFAULT_META = {
  gridWidth: 84,
  mode: 'average',
  mergeThreshold: 8,
  maxColors: 0,
  palettePresetId: 'pindou-full',
}

function resolveBackgroundPaletteIds(entries) {
  const whiteHexes = new Set(['#FFFFFF', '#FEFEFE', '#F5F5F5', '#F4F4F4', '#FAFAFA'])
  const normalizeHex = (hex) => {
    const compact = hex.replace(/[^0-9A-F]/gi, '').slice(0, 6)
    return compact.length === 6 ? `#${compact.toUpperCase()}` : '#E8E8E8'
  }
  const exactWhites = entries.filter((e) => whiteHexes.has(normalizeHex(e.hex)))
  if (exactWhites.length) return exactWhites.slice(0, 3).map((e) => e.id)
  const neutrals = entries.filter((e) => /^neutral-00[0-2]$/i.test(e.id)).sort((a, b) => a.id.localeCompare(b.id))
  if (neutrals.length) return neutrals.map((e) => e.id)
  return entries.length ? [entries[0].id] : []
}

async function loadPixels(fileUrl) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const result = await page.evaluate(async (url) => {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    const maxEdge = 800
    let w = img.width
    let h = img.height
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
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    return { pixels: Array.from(data), width: w, height: h }
  }, fileUrl)
  await browser.close()
  return result
}

async function saveBeforeJpeg(fileUrl, outPath) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const size = await page.evaluate(async (url) => {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    return { width: img.width, height: img.height }
  }, fileUrl)
  await page.setViewportSize({ width: size.width, height: size.height })
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0"><img src="${fileUrl}" style="display:block;width:100%;height:auto" /></body></html>`,
    { waitUntil: 'load' },
  )
  const imgEl = page.locator('img')
  await imgEl.screenshot({ path: outPath, type: 'jpeg', quality: 88 })
  await browser.close()
  return size
}

async function renderGridPng(grid, outPath) {
  const cols = grid[0]?.length ?? 1
  const rows = grid.length
  const cellSize = Math.max(4, Math.floor(960 / cols))
  const width = cols * cellSize
  const height = rows * cellSize
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent('<!DOCTYPE html><html><body style="margin:0"><canvas id="c"></canvas></body></html>')
  await page.evaluate(
    ({ grid, cellSize }) => {
      const canvas = document.getElementById('c')
      const cols = grid[0].length
      const rows = grid.length
      canvas.width = cols * cellSize
      canvas.height = rows * cellSize
      const ctx = canvas.getContext('2d')
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c]
          ctx.fillStyle = cell.isExternal ? '#E4E4E4' : cell.hex
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
        }
      }
    },
    { grid, cellSize },
  )
  await page.locator('#c').screenshot({ path: outPath, type: 'png' })
  await browser.close()
  return { width, height, cellSize }
}

async function main() {
  const inputPath = existsSync(sourcePath) ? sourcePath : beforeOut
  if (!existsSync(inputPath)) {
    console.error('[landing-compare] missing source image:', sourcePath, 'or', beforeOut)
    process.exit(1)
  }

  mkdirSync(galleryDir, { recursive: true })

  const meta = existsSync(metaOut)
    ? { ...DEFAULT_META, ...JSON.parse(readFileSync(metaOut, 'utf8')) }
    : { ...DEFAULT_META }

  const palette = JSON.parse(readFileSync(join(root, 'public', 'static', 'palettes', 'full.json'), 'utf8'))
  const entries = palette.entries ?? []
  const backgroundPaletteIds = resolveBackgroundPaletteIds(entries)

  const fileUrl = `file:///${inputPath.replace(/\\/g, '/')}`
  const { pixels: pixelArr, width, height } = await loadPixels(fileUrl)
  const pixels = new Uint8ClampedArray(pixelArr)

  const { grid } = runPipeline(pixels, width, height, {
    gridWidth: meta.gridWidth ?? DEFAULT_META.gridWidth,
    mode: meta.mode ?? DEFAULT_META.mode,
    mergeThreshold: meta.mergeThreshold ?? DEFAULT_META.mergeThreshold,
    maxColors: meta.maxColors ?? 0,
    backgroundPaletteIds,
    excludedPaletteIds: [],
    palette: entries,
  })

  const beforeSize = await saveBeforeJpeg(fileUrl, beforeOut)
  const afterSize = await renderGridPng(grid, afterOut)

  const outMeta = {
    width: beforeSize.width,
    height: beforeSize.height,
    aspectRatio: `${beforeSize.width} / ${beforeSize.height}`,
    gridWidth: meta.gridWidth ?? DEFAULT_META.gridWidth,
    palettePresetId: meta.palettePresetId ?? DEFAULT_META.palettePresetId,
    afterWidth: afterSize.width,
    afterHeight: afterSize.height,
  }
  writeFileSync(metaOut, `${JSON.stringify(outMeta, null, 2)}\n`, 'utf8')

  console.log('[landing-compare] wrote', beforeOut)
  console.log('[landing-compare] wrote', afterOut)
  console.log('[landing-compare] wrote', metaOut)
}

main().catch((error) => {
  console.error('[landing-compare] failed:', error)
  process.exit(1)
})
