import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src')
const uniRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uni-pindou/src')

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
  return text
    .replace(/<!--\s*#ifdef[\s\S]*?-->/g, '')
    .replace(/<!--\s*#ifndef H5[\s\S]*?-->/g, '')
    .replace(/<!--\s*#ifndef[\s\S]*?-->/g, '')
    .replace(/<!--\s*#endif\s*-->/g, '')
}

function extractCnStrings(text) {
  const out = []
  const re = /["'`]([^"'`\n]*[\u4e00-\u9fff][^"'`\n]*)["'`]/g
  let m
  while ((m = re.exec(text))) out.push(m[1])
  const re2 = />([^<>{}\n]*[\u4e00-\u9fff][^<>{}\n]*)</g
  while ((m = re2.exec(text))) {
    const s = m[1].trim()
    if (s && !s.startsWith('{{')) out.push(s)
  }
  return out
}

function extractCorruptedStrings(text) {
  const out = []
  const re = /["'`]([^"'`\n]*\?{2,}[^"'`\n]*)["'`]/g
  let m
  while ((m = re.exec(text))) out.push({ kind: 'quote', value: m[1], full: m[0] })
  const re2 = />([^<>{}\n]*\?{2,}[^<>{}\n]*)</g
  while ((m = re2.exec(text))) {
    const s = m[1].trim()
    if (s) out.push({ kind: 'tag', value: s, full: `>${s}<` })
  }
  return out
}

let fixed = 0
for (const [webRel, uniRel] of Object.entries(FILE_MAP)) {
  const webPath = path.join(webRoot, webRel)
  const uniPath = path.join(uniRoot, uniRel)
  if (!fs.existsSync(webPath) || !fs.existsSync(uniPath)) continue

  let webText = fs.readFileSync(webPath, 'utf8')
  const uniText = stripIfdefs(fs.readFileSync(uniPath, 'utf8'))
  const corrupted = extractCorruptedStrings(webText)
  if (!corrupted.length) continue

  const cnPool = extractCnStrings(uniText)
  let ci = 0
  for (const c of corrupted) {
    const replacement = cnPool[ci] ?? cnPool.find((s) => s.length >= c.value.replace(/\?/g, '').length) ?? null
    if (!replacement) continue
    webText = webText.replace(c.value, replacement)
    ci++
    fixed++
    console.log(`${webRel}: "${c.value}" -> "${replacement}"`)
  }
  fs.writeFileSync(webPath, webText, 'utf8')
}

// hard-coded known syntax corruption
const hardFixes = [
  {
    file: 'components/WorkspaceParamStrip.vue',
    from: "emit('update', { mode: props.params.mode === 'average'格数'dominant' : 'average' })",
    to: "emit('update', { mode: props.params.mode === 'average' ? 'dominant' : 'average' })",
  },
]

for (const { file, from, to } of hardFixes) {
  const p = path.join(webRoot, file)
  let s = fs.readFileSync(p, 'utf8')
  if (s.includes(from)) {
    s = s.replace(from, to)
    fs.writeFileSync(p, s, 'utf8')
    console.log('hard fix:', file)
    fixed++
  }
}

console.log(`Fixed ${fixed} strings`)
