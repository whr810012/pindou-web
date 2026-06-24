import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2]
if (!root) process.exit(1)

const UI_IMPORT =
  "import PButton from '@/components/ui/PButton.vue'\nimport PDrawer from '@/components/ui/PDrawer.vue'\nimport PTag from '@/components/ui/PTag.vue'\nimport PCell from '@/components/ui/PCell.vue'\nimport PSwitch from '@/components/ui/PSwitch.vue'\nimport PNumberBox from '@/components/ui/PNumberBox.vue'\nimport PLineProgress from '@/components/ui/PLineProgress.vue'\n"
const PLATFORM_IMPORT =
  "import { showToast, showModal, showActionSheet, setClipboardData, getSystemInfoSync, scanCode, chooseMessageFile, getFileSystemManager, request } from '@/utils/platform-ui'\n"
const ROUTER_IMPORT = "import { useRouter } from 'vue-router'\n"

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue')) files.push(full)
  }
  return files
}

function patch(content) {
  let text = content
  if (text.includes('uni.')) {
    if (!text.includes("from '@/utils/platform-ui'")) {
      text = text.replace(/<script setup lang="ts">\n/, `<script setup lang="ts">\n${PLATFORM_IMPORT}`)
    }
    text = text.replace(/\buni\.showToast\b/g, 'showToast')
    text = text.replace(/\buni\.showModal\b/g, 'showModal')
    text = text.replace(/\buni\.showActionSheet\b/g, 'showActionSheet')
    text = text.replace(/\buni\.setClipboardData\b/g, 'setClipboardData')
    text = text.replace(/\buni\.getSystemInfoSync\b/g, 'getSystemInfoSync')
    text = text.replace(/\buni\.scanCode\b/g, 'scanCode')
    text = text.replace(/\buni\.chooseMessageFile\b/g, 'chooseMessageFile')
    text = text.replace(/\buni\.getFileSystemManager\b/g, 'getFileSystemManager')
    text = text.replace(/\buni\.request\b/g, 'request')
    text = text.replace(/\buni\.navigateBack\b/g, 'router.back()')
  }
  if (text.includes('<u-') || text.includes('</u-')) {
    if (!text.includes("from '@/components/ui/PButton.vue'")) {
      text = text.replace(/<script setup lang="ts">\n/, `<script setup lang="ts">\n${UI_IMPORT}`)
    }
    text = text.replace(/<u-button/g, '<PButton')
    text = text.replace(/<\/u-button>/g, '</PButton>')
    text = text.replace(/<u-popup/g, '<PDrawer')
    text = text.replace(/<\/u-popup>/g, '</PDrawer>')
    text = text.replace(/<u-tag/g, '<PTag')
    text = text.replace(/<\/u-tag>/g, '</PTag>')
    text = text.replace(/<u-cell/g, '<PCell')
    text = text.replace(/<\/u-cell>/g, '</PCell>')
    text = text.replace(/<u-switch/g, '<PSwitch')
    text = text.replace(/<\/u-switch>/g, '</PSwitch>')
    text = text.replace(/<u-number-box/g, '<PNumberBox')
    text = text.replace(/<\/u-number-box>/g, '</PNumberBox>')
    text = text.replace(/<u-line-progress/g, '<PLineProgress')
    text = text.replace(/<\/u-line-progress>/g, '</PLineProgress>')
    text = text.replace(/:show="/g, ':modelValue="')
    text = text.replace(/@close="/g, '@update:modelValue="')
  }
  if (text.includes('router.push') && !text.includes('useRouter')) {
    text = text.replace(/<script setup lang="ts">\n/, `<script setup lang="ts">\n${ROUTER_IMPORT}`)
    if (!text.includes('const router = useRouter()')) {
      text = text.replace(
        /(<script setup lang="ts">[\s\S]*?\n)(const |function |import [^c])/,
        '$1const router = useRouter()\n$2',
      )
    }
  }
  text = text.replace(/import \{ exportPatternToTempFile \} from '@\/utils\/exportMp'\n/g, '')
  text = text.replace(/,\s*saveTempImageToAlbum/g, '')
  text = text.replace(/saveTempImageToAlbum,\n/g, '')
  text = text.replace(/await saveTempImageToAlbum\([^)]*\)\n?/g, '')
  text = text.replace(/exportPatternToTempFile\([^)]*\)/g, "''")
  text = text.replace(/<canvas canvas-id="[^"]*"[^>]*\/>/g, '')
  return text
}

for (const file of walk(root)) {
  const raw = fs.readFileSync(file, 'utf8')
  const next = patch(raw)
  if (next !== raw) fs.writeFileSync(file, next)
  console.log('patched', file)
}
