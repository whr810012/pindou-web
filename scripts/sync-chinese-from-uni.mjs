/**
 * Sync Chinese UI strings from uni-pindou to web-pindou by replacing
 * corrupted ? placeholders in template/script string literals.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.join(__dirname, '../src')
const uniRoot = path.join(__dirname, '../../uni-pindou/src')

const FILE_MAP = {
  'pages/WorkspacePage.vue': 'pages/workspace/workspace.vue',
  'pages/EditorPage.vue': 'pages/editor/editor.vue',
  'pages/FocusPage.vue': 'pages/focus/focus.vue',
  'pages/ProjectsPage.vue': 'pages/projects/projects.vue',
  'pages/GalleryPage.vue': 'pages/gallery/gallery.vue',
  'pages/Preview3dPage.vue': 'pages/preview3d/preview3d.vue',
  'pages/PaletteEditorPage.vue': 'pages/palette-editor/palette-editor.vue',
  'pages/IndexPage.vue': 'pages/index/index.vue',
  'components/SettingsDrawer.vue': 'components/SettingsDrawer.vue',
  'components/CompareSheet.vue': 'components/CompareSheet.vue',
  'components/ExportSheet.vue': 'components/ExportSheet.vue',
  'components/AiPreprocessSheet.vue': 'components/AiPreprocessSheet.vue',
  'components/ProjectSaveSheet.vue': 'components/ProjectSaveSheet.vue',
  'components/PalettePickerModal.vue': 'components/PalettePickerModal.vue',
  'components/ColorPanel.vue': 'components/ColorPanel.vue',
  'components/WorkspaceParamStrip.vue': 'components/WorkspaceParamStrip.vue',
  'components/FloatingToolbar.vue': 'components/FloatingToolbar.vue',
  'components/FloatingPalette.vue': 'components/FloatingPalette.vue',
  'components/EditorViewportBar.vue': 'components/EditorViewportBar.vue',
  'components/MagnifierOverlay.vue': 'components/MagnifierOverlay.vue',
  'components/EditorHistorySheet.vue': 'components/EditorHistorySheet.vue',
  'components/ImageCropperModal.vue': 'components/ImageCropperModal.vue',
  'components/PaletteShareSheet.vue': 'components/PaletteShareSheet.vue',
}

function stripIfdefs(text) {
  let out = text
  out = out.replace(/<!--\s*#ifdef[\s\S]*?-->/g, '')
  out = out.replace(/<!--\s*#ifndef H5[\s\S]*?-->/g, '')
  out = out.replace(/<!--\s*#ifndef[\s\S]*?-->/g, '')
  out = out.replace(/<!--\s*#endif\s*-->/g, '')
  return out
}

function extractChineseStrings(text) {
  const strings = []
  const patterns = [
    /(?:text|title|placeholder|placeholderText|label|content|hint|aria-label)=["']([^"']+)["']/g,
    /showToast\(\{\s*title:\s*["']([^"']+)["']/g,
    /showModal\(\{\s*title:\s*["']([^"']+)["']/g,
    /title:\s*["']([^"']+)["']/g,
    />([^<>{}\n]+)</g,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(text))) {
      const s = m[1].trim()
      if (!s || s.startsWith('{{') || /^[\d\s%+\-/.:,]+$/.test(s)) continue
      if (/[\u4e00-\u9fff]/.test(s)) strings.push(s)
    }
  }
  return [...new Set(strings)]
}

function isCorrupted(s) {
  return /\?{2,}/.test(s) || (s.includes('?') && !/[\u4e00-\u9fff]/.test(s))
}

function findCorruptedInFile(text) {
  const hits = []
  const re = /(["'`])([^"'`]*?\?+[^"'`]*?)\1/g
  let m
  while ((m = re.exec(text))) {
    const s = m[2]
    if (isCorrupted(s)) hits.push({ full: m[0], inner: s, index: m.index })
  }
  // also >???< in template
  const re2 = />([^<>{}\n]*\?{2,}[^<>{}\n]*)</g
  while ((m = re2.exec(text))) {
    hits.push({ full: `>${m[1]}<`, inner: m[1].trim(), index: m.index })
  }
  return hits
}

function bestMatch(corrupted, candidates) {
  const cLen = corrupted.replace(/\?/g, '').length
  const qCount = (corrupted.match(/\?/g) || []).length
  let best = null
  let bestScore = -1
  for (const cand of candidates) {
    if (cand.includes('?')) continue
    const lenDiff = Math.abs(cand.length - corrupted.length)
    const score = 1000 - lenDiff * 10 + (cand.length > 2 ? 5 : 0)
    if (qCount > 0 && cand.length >= qCount && score > bestScore) {
      best = cand
      bestScore = score
    }
  }
  return best
}

function syncFile(webRel) {
  const uniRel = FILE_MAP[webRel]
  if (!uniRel) return
  const webPath = path.join(webRoot, webRel)
  const uniPath = path.join(uniRoot, uniRel)
  if (!fs.existsSync(webPath) || !fs.existsSync(uniPath)) {
    console.warn('skip missing', webRel)
    return
  }

  let webText = fs.readFileSync(webPath, 'utf8')
  const uniText = stripIfdefs(fs.readFileSync(uniPath, 'utf8'))
  const uniStrings = extractChineseStrings(uniText)
  const corrupted = findCorruptedInFile(webText)

  if (!corrupted.length) return

  let replaced = 0
  for (const hit of corrupted) {
    const match = uniStrings.find((u) => {
      if (hit.inner.replace(/\?/g, '').length === 0) return true
      return u.includes(hit.inner.replace(/\?+/g, '').slice(0, 2))
    }) || bestMatch(hit.inner, uniStrings.filter((s) => s.length >= hit.inner.length - 4))

    if (match && match !== hit.inner) {
      webText = webText.replace(hit.inner, match)
      replaced++
      console.log(`  ${webRel}: "${hit.inner}" -> "${match}"`)
    }
  }

  if (replaced) {
    fs.writeFileSync(webPath, webText, 'utf8')
    console.log(`patched ${webRel} (${replaced} strings)`)
  }
}

// scan all vue files for remaining corruption
function scanAll() {
  const bad = []
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (p.endsWith('.vue')) {
        const hits = findCorruptedInFile(fs.readFileSync(p, 'utf8'))
        if (hits.length) bad.push({ file: path.relative(webRoot, p), hits: hits.map((h) => h.inner) })
      }
    }
  }
  walk(webRoot)
  return bad
}

console.log('=== Syncing from uni source ===')
for (const webRel of Object.keys(FILE_MAP)) syncFile(webRel)

console.log('\n=== Remaining corrupted strings ===')
const remaining = scanAll()
if (!remaining.length) {
  console.log('None found.')
} else {
  for (const r of remaining) {
    console.log(r.file, r.hits.slice(0, 8))
  }
}
