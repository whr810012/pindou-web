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

function normalizeUni(content) {
  return stripIfdefs(content)
    .replace(/<\/?view\b/g, (m) => m.replace('view', 'div'))
    .replace(/<\/?scroll-view\b/g, (m) => m.replace('scroll-view', 'div'))
    .replace(/<\/?text\b/g, (m) => m.replace('text', 'span'))
    .replace(/<\/?image\b/g, (m) => m.replace('image', 'img'))
    .replace(/\bmode="[^"]*"/g, '')
    .replace(/<u-button([^>]*)>/g, '<PButton$1>')
    .replace(/<\/u-button>/g, '</PButton>')
    .replace(/<u-popup([^>]*)>/g, '<PDrawer$1>')
    .replace(/<\/u-popup>/g, '</PDrawer>')
    .replace(/<u-cell([^>]*)>/g, '<PCell$1>')
    .replace(/<\/u-cell>/g, '</PCell>')
    .replace(/<u-tag([^>]*)>/g, '<PTag$1>')
    .replace(/<\/u-tag>/g, '</PTag>')
    .replace(/<u-switch([^/]*)\/>/g, '<PSwitch$1 />')
    .replace(/<u-number-box([^/]*)\/>/g, '<PNumberBox$1 />')
    .replace(/<u-line-progress([^/]*)\/>/g, '<PLineProgress$1 />')
    .replace(/uni\.showToast/g, 'showToast')
    .replace(/uni\.showModal/g, 'showModal')
    .replace(/uni\.showActionSheet/g, 'showActionSheet')
    .replace(/uni\.setClipboardData/g, 'setClipboardData')
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/index\/index'\s*\}\)/g, "router.push('/')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/workspace\/workspace'\s*\}\)/g, "router.push('/workspace')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/editor\/editor'\s*\}\)/g, "router.push('/editor')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/focus\/focus'\s*\}\)/g, "router.push('/focus')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/projects\/projects'\s*\}\)/g, "router.push('/projects')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/gallery\/gallery'\s*\}\)/g, "router.push('/gallery')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/preview3d\/preview3d'\s*\}\)/g, "router.push('/preview3d')")
    .replace(/uni\.navigateTo\(\{\s*url:\s*'\/pages\/palette-editor\/palette-editor'\s*\}\)/g, "router.push('/palette')")
    .replace(/:show="/g, ':modelValue="')
    .replace(/@close="/g, '@update:modelValue="')
}

function extractParts(content) {
  const script = content.match(/<script[\s\S]*?<\/script>/)?.[0] ?? ''
  const template = content.match(/<template>[\s\S]*?<\/template>/)?.[0] ?? ''
  const style = content.match(/<style[\s\S]*<\/style>/)?.[0] ?? ''
  return { script, template, style }
}

function hasCorruption(text) {
  return /\?{2,}/.test(text) || (/\?/.test(text) && !/[\u4e00-\u9fff]/.test(text) && /["'`>]/.test(text))
}

function mergeWebWithUniTemplate(webRel) {
  const uniRel = FILE_MAP[webRel]
  if (!uniRel) return false
  const webPath = path.join(webRoot, webRel)
  const uniPath = path.join(uniRoot, uniRel)
  if (!fs.existsSync(webPath) || !fs.existsSync(uniPath)) return false

  const web = extractParts(fs.readFileSync(webPath, 'utf8'))
  const uni = extractParts(normalizeUni(fs.readFileSync(uniPath, 'utf8')))

  const webCorrupt = hasCorruption(web.template) || hasCorruption(web.script)
  const uniHasChinese = /[\u4e00-\u9fff]/.test(uni.template)

  if (!webCorrupt && !hasCorruption(web.template)) {
    // still patch template from uni if web template lacks chinese but uni has it
    const webTplCn = (web.template.match(/[\u4e00-\u9fff]/g) || []).length
    const uniTplCn = (uni.template.match(/[\u4e00-\u9fff]/g) || []).length
    if (webTplCn >= uniTplCn * 0.8) return false
  }

  if (!uniHasChinese) return false

  // Keep web script, replace template from uni (web-specific bindings preserved via manual list)
  const keepWebTemplate = [
    'pages/GalleryDetailPage.vue',
    'components/BeadCanvas.vue',
    'components/ThreeBeadViewer.vue',
  ]
  if (keepWebTemplate.includes(webRel)) return false

  let template = uni.template
  // web-specific prop fixes
  template = template
    .replace(/:modelValue="/g, ':show="')
    .replace(/@update:modelValue="/g, '@close="')
    .replace(/scroll-x/g, '')
    .replace(/scroll-y/g, '')
    .replace(/:show-scrollbar="[^"]*"/g, '')
    .replace(/<slider[\s\S]*?<\/slider>/g, (block) => {
      // replace uni slider with range input
      const valueMatch = block.match(/:value="([^"]+)"/)
      const val = valueMatch?.[1] ?? 'split'
      return `<input type="range" class="split-slider" :value="${val}" min="0" max="100" step="1" @input="onSplitInput" />`
    })
    .replace(/<img([^>]*)\/>/g, '<img$1 />')
    .replace(/round="16"/g, '')

  const out = `${web.script}\n\n${template}\n\n${web.style}`
  fs.writeFileSync(webPath, out, 'utf8')
  console.log('merged template from uni:', webRel)
  return true
}

let count = 0
for (const rel of Object.keys(FILE_MAP)) {
  if (mergeWebWithUniTemplate(rel)) count++
}
console.log(`Done. Updated ${count} files.`)

// final scan
const bad = []
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (p.endsWith('.vue')) {
      const t = fs.readFileSync(p, 'utf8')
      if (/\?{2,}/.test(t.replace(/\?\?[\s\[\.\),']/g, '##').replace(/\?\.\w/g, '##'))) {
        const lines = t.split(/\n/).filter((l) => /\?{2,}/.test(l) && !/\?\?[\s\[\.\),']/.test(l))
        if (lines.length) bad.push({ file: path.relative(webRoot, p), n: lines.length })
      }
    }
  }
}
walk(webRoot)
console.log('Remaining:', bad.length ? bad : 'none')
