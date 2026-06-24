import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '../../uni-pindou/src/components')
const dstDir = path.join(__dirname, '../src/components')
const keep = new Set([
  'BeadCanvas.vue',
  'ImageCropperModal.vue',
  'MagnifierOverlay.vue',
  'PaletteShareSheet.vue',
  'ProjectThumbnail.vue',
  'EditorHistorySheet.vue',
  'ui',
])

for (const f of fs.readdirSync(srcDir)) {
  if (keep.has(f) || f.startsWith('Mp')) continue
  fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f))
}

execSync(`node "${path.join(__dirname, 'convert-uni-vue.mjs')}" "${dstDir}"`, { stdio: 'inherit' })
const patchTargets = fs
  .readdirSync(dstDir)
  .filter((f) => !keep.has(f) && !f.startsWith('Mp') && f.endsWith('.vue'))
  .map((f) => path.join(dstDir, f))
if (patchTargets.length) {
  execSync(`node "${path.join(__dirname, 'patch-web-vue.mjs')}" "${dstDir}"`, { stdio: 'inherit' })
}
