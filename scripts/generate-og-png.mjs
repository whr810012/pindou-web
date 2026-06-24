import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'static', 'seo', 'og-cover.svg')
const pngPath = join(root, 'public', 'static', 'seo', 'og-cover.png')

async function generateWithPlaywright() {
  const { chromium } = await import('playwright')
  const svg = readFileSync(svgPath, 'utf8')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;background:#5B6CFF">${svg}</body></html>`,
    { waitUntil: 'load' },
  )
  await page.screenshot({ path: pngPath, type: 'png' })
  await browser.close()
}

async function main() {
  if (!existsSync(svgPath)) {
    console.error('[og-png] missing', svgPath)
    process.exit(1)
  }

  await generateWithPlaywright()
  console.log('[og-png] wrote', pngPath)
}

main().catch((error) => {
  console.error('[og-png] failed:', error.message)
  process.exit(1)
})
