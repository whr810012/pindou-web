<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fillRegion, paintRect, flipGridHorizontal, flipGridVertical } from '@wangdandan810012/bead-core'
import BeadCanvas from '@/components/BeadCanvas.vue'
import EditorHistorySheet from '@/components/EditorHistorySheet.vue'
import EditorViewportBar from '@/components/EditorViewportBar.vue'
import FloatingPalette from '@/components/FloatingPalette.vue'
import FloatingToolbar from '@/components/FloatingToolbar.vue'
import PButton from '@/components/ui/PButton.vue'
import { useEditorStore } from '@/stores/editor'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { EDITOR_TOOL_META } from '@/utils/editorHints'
import { replaceColorInGrid } from '@/utils/pipeline'
import { resolveEraserEntry, eraserDisplayCode, normalizePaletteHex } from '@pindou/app-shared'
import { showToast } from '@/utils/platform-ui'
import { usePageSeo } from '@/utils/seo'

usePageSeo('editor')

const router = useRouter()
const project = useProjectStore()
const paletteStore = usePaletteStore()
const editor = useEditorStore()

const historyVisible = ref(false)
const viewScale = ref(1)
const viewOffset = ref({ x: 0, y: 0 })
const panEnabled = ref(false)
const guideDismissed = ref(false)
const GUIDE_KEY = 'pindou.editor.guide.dismissed'

const grid = computed(() => project.grid)
const rectMode = computed(() => editor.tool === 'rect')
const dragPaint = computed(() => editor.tool === 'brush' || editor.tool === 'eraser')

const toolMeta = computed(() => EDITOR_TOOL_META[editor.tool])

const eraserEntry = computed(() =>
  resolveEraserEntry(paletteStore.activeEntries, paletteStore.fullEntries),
)

const eraserLabel = computed(() =>
  eraserDisplayCode(eraserEntry.value, (id) => paletteStore.getDisplayCode(id)),
)

const statusHint = computed(() => {
  if (editor.tool === 'replace' && !editor.replaceFromId) {
    return '换色�?1 步：点击图纸上要替换的旧颜色'
  }
  if (editor.tool === 'replace' && editor.replaceFromId) {
    return `换色�?2 步：在色板选择新颜色，将自动替换全图`
  }
  if (panEnabled.value) {
    return '平移模式：拖动画布查看，点顶栏「平移」退�?
  }
  if (editor.tool === 'eraser') {
    return `擦除格子变为空白背景�?{eraserLabel.value}），不计入用豆量；可用画笔重新绘制`
  }
  return toolMeta.value.hint
})

onMounted(async () => {
  guideDismissed.value = localStorage.getItem(GUIDE_KEY) === '1'
  window.addEventListener('keydown', onKeyDown)
  if (paletteStore.activeEntries.length === 0) {
    await paletteStore.loadPalettes().catch(console.error)
  }
  if (!editor.selectedPaletteId && paletteStore.activeEntries[0]) {
    const first = paletteStore.activeEntries[0]
    editor.selectColor(first.id, first.hex)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function dismissGuide() {
  guideDismissed.value = true
  localStorage.setItem(GUIDE_KEY, '1')
}

function goBack() {
  router.push('/workspace')
}

function applyCell(row: number, col: number) {
  if (!project.grid) return
  const cell = project.grid[row][col]

  const needsStroke = editor.tool === 'brush' || editor.tool === 'eraser'
  if (needsStroke) editor.beginStroke(project.grid)
  else editor.pushHistory(project.grid)

  if (editor.tool === 'eraser') {
    if (cell.isExternal) return
    const entry = eraserEntry.value
    if (!entry) {
      showToast({ title: '未找到背景色，请切换全色系色�?, icon: 'none' })
      return
    }
    project.eraseCell(row, col, entry.id, normalizePaletteHex(entry.hex))
    return
  }

  if (editor.tool === 'brush') {
    if (!editor.selectedPaletteId) {
      showToast({ title: '请先在色板选择颜色', icon: 'none' })
      return
    }
    project.updateCell(row, col, editor.selectedPaletteId, editor.selectedHex)
    return
  }

  if (cell.isExternal) return

  if (editor.tool === 'picker') {
    editor.selectColor(cell.paletteId, cell.hex)
    showToast({ title: `已吸�?${paletteStore.getDisplayCode(cell.paletteId)}`, icon: 'none' })
    return
  }

  if (editor.tool === 'fill') {
    const filled = fillRegion(
      project.grid,
      row,
      col,
      editor.selectedPaletteId,
      editor.selectedHex,
    )
    project.setGrid(filled)
    return
  }

  if (editor.tool === 'replace' && editor.replaceFromId) {
    editor.pushHistory(project.grid)
    const updated = replaceColorInGrid(
      project.grid,
      editor.replaceFromId,
      editor.selectedPaletteId,
      editor.selectedHex,
    )
    project.setGrid(updated)
    editor.replaceFromId = ''
    showToast({ title: '全图换色完成', icon: 'success' })
    return
  }
}

function onRectSelect({ row0, col0, row1, col1 }: { row0: number; col0: number; row1: number; col1: number }) {
  if (!project.grid) return
  editor.pushHistory(project.grid)
  const painted = paintRect(
    project.grid,
    row0,
    col0,
    row1,
    col1,
    editor.selectedPaletteId,
    editor.selectedHex,
  )
  project.setGrid(painted)
  showToast({ title: '已填充选区', icon: 'success' })
}

function onCellTap({ row, col }: { row: number; col: number }) {
  if (editor.tool === 'rect') return
  if (editor.tool === 'replace' && !editor.replaceFromId && project.grid) {
    editor.replaceFromId = project.grid[row][col].paletteId
    const code = paletteStore.getDisplayCode(editor.replaceFromId)
    showToast({ title: `已选旧�?${code}，请选新色`, icon: 'none' })
    return
  }
  applyCell(row, col)
}

function onStrokeEnd() {
  editor.endStroke()
}

function undo() {
  if (!project.grid) return
  const prev = editor.undo(project.grid)
  if (prev) project.setGrid(prev)
}

function redo() {
  if (!project.grid) return
  const next = editor.redo(project.grid)
  if (next) project.setGrid(next)
}

function jumpHistory(index: number) {
  if (!project.grid) return
  const target = editor.jumpToSnapshot(index, project.grid)
  if (target) project.setGrid(target)
  historyVisible.value = false
}

function clearHistory() {
  editor.resetHistory()
  historyVisible.value = false
  showToast({ title: '已清空历�?, icon: 'none' })
}

function zoomIn() {
  viewScale.value = Math.min(3, viewScale.value * 1.2)
}

function zoomOut() {
  viewScale.value = Math.max(0.35, viewScale.value / 1.2)
}

function resetView() {
  viewScale.value = 1
  viewOffset.value = { x: 0, y: 0 }
}

function onPaletteSelect(entry: { id: string; hex: string }) {
  editor.selectColor(entry.id, entry.hex)
  if (editor.tool !== 'replace' || !editor.replaceFromId || !project.grid) return
  const updated = replaceColorInGrid(
    project.grid,
    editor.replaceFromId,
    entry.id,
    entry.hex,
  )
  project.setGrid(updated)
  editor.replaceFromId = ''
  showToast({ title: '全图换色完成', icon: 'success' })
}

function togglePan() {
  panEnabled.value = !panEnabled.value
}

function onViewOffset(offset: { x: number; y: number }) {
  viewOffset.value = offset
}

function flipHorizontal() {
  if (!project.grid) return
  editor.pushHistory(project.grid)
  project.setGrid(flipGridHorizontal(project.grid))
  showToast({ title: '已水平翻�?, icon: 'success' })
}

function flipVertical() {
  if (!project.grid) return
  editor.pushHistory(project.grid)
  project.setGrid(flipGridVertical(project.grid))
  showToast({ title: '已垂直翻�?, icon: 'success' })
}

function onKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  const key = event.key.toLowerCase()
  const toolMap: Record<string, typeof editor.tool> = {
    b: 'brush',
    f: 'fill',
    m: 'rect',
    e: 'eraser',
    i: 'picker',
    r: 'replace',
  }

  if ((event.ctrlKey || event.metaKey) && key === 'z') {
    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
    return
  }
  if ((event.ctrlKey || event.metaKey) && key === 'y') {
    event.preventDefault()
    redo()
    return
  }
  if (key === 'escape') {
    goBack()
    return
  }
  if (toolMap[key]) {
    editor.setTool(toolMap[key])
    if (toolMap[key] !== 'replace') editor.replaceFromId = ''
  }
}
</script>

<template>
  <div class="page page--editor">
    <header class="craft-editor-bar">
      <button type="button" class="craft-editor-back" @click="goBack">�?工作�?/button>
      <div class="editor-title">
        <span class="name">{{ project.projectName }}</span>
        <span v-if="grid" class="meta">{{ grid[0]?.length }}×{{ grid.length }} �?/span>
      </div>
      <PButton size="mini" plain text="完成" @click="goBack" />
    </header>

    <div v-if="!grid" class="empty-state">
      <p>请先在「工作台」上传图片并生成图纸</p>
      <PButton type="primary" text="去工作台" @click="goBack" />
    </div>

    <template v-else>
      <div v-if="!guideDismissed" class="editor-guide card-hint">
        <strong>精修模式�?/strong>下方选工�?�?色板选色 �?在画布上点击或拖动�?        滚轮缩放，需要移动视图时开启「平移」�?        <button type="button" class="guide-dismiss" @click="dismissGuide">知道�?/button>
      </div>

      <div class="tool-hint" :class="{ 'tool-hint--warn': editor.tool === 'replace' }">
        <span class="tool-hint-icon">{{ toolMeta.icon }}</span>
        <span class="tool-hint-text">
          <strong>{{ toolMeta.label }}</strong>
          {{ statusHint }}
        </span>
      </div>

      <EditorViewportBar
        :scale="viewScale"
        :pan-enabled="panEnabled"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @reset="resetView"
        @toggle-pan="togglePan"
      />

      <div class="flip-bar">
        <PButton size="mini" plain text="�?水平翻转" @click="flipHorizontal" />
        <PButton size="mini" plain text="�?垂直翻转" @click="flipVertical" />
      </div>

      <div class="canvas-area">
        <BeadCanvas
          :grid="grid"
          :cell-size="12"
          :show-grid="true"
          :interactive="true"
          :rect-select-mode="rectMode"
          :drag-paint="dragPaint && !panEnabled"
          :show-color-code="true"
          :enable-viewport="true"
          :view-scale="viewScale"
          :view-offset-x="viewOffset.x"
          :view-offset-y="viewOffset.y"
          :pan-enabled="panEnabled"
          :code-lookup="(id) => paletteStore.getDisplayCode(id)"
          @update:view-scale="viewScale = $event"
          @update:view-offset="onViewOffset"
          @cell-tap="onCellTap"
          @rect-select="onRectSelect"
          @stroke-end="onStrokeEnd"
        />
      </div>

      <FloatingPalette
        v-if="editor.tool !== 'eraser'"
        :entries="paletteStore.activeEntries"
        :selected-id="editor.selectedPaletteId"
        :selected-hex="editor.selectedHex"
        :code-lookup="(id) => paletteStore.getDisplayCode(id)"
        @select="onPaletteSelect"
      />
      <div v-else class="eraser-bar">
        <div class="eraser-preview">
          <span class="eraser-icon">🧹</span>
          <div>
            <span class="eraser-title">橡皮模式</span>
            <span class="eraser-desc">擦除后显示灰色空白格，背景色�?{{ eraserLabel }}</span>
          </div>
        </div>
      </div>
      <FloatingToolbar
        :tool="editor.tool"
        :can-undo="editor.canUndo"
        :can-redo="editor.canRedo"
        :history-count="editor.snapshotCount"
        @change="(t) => { editor.setTool(t); if (t !== 'replace') editor.replaceFromId = '' }"
        @undo="undo"
        @redo="redo"
        @history="historyVisible = true"
      />
      <EditorHistorySheet
        :show="historyVisible"
        @close="historyVisible = false"
        @jump="jumpHistory"
        @clear="clearHistory"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.editor-title {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  font-family: $pindou-font-display;
  font-weight: 700;
  font-size: $pindou-font-md;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
}

.flip-bar {
  display: flex;
  gap: 8px;
  margin-bottom: $pindou-space-sm;
}

.editor-guide {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  line-height: 1.5;
}

.guide-dismiss {
  margin-left: auto;
  border: none;
  background: transparent;
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  cursor: pointer;
  white-space: nowrap;
}

.tool-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: $pindou-space-sm;
  background: $pindou-bg-card;
  border-radius: $pindou-radius-sm;
  border: 1px solid $pindou-border-light;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.45;
}

.tool-hint--warn {
  background: $pindou-warning-bg;
  border-color: transparent;
  color: $pindou-warning;
}

.tool-hint-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.tool-hint-text strong {
  color: $pindou-text;
  margin-right: 6px;
}

.canvas-area {
  overflow: auto;
  max-height: calc(100vh - 320px);
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
}

.eraser-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 148px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 99;
  border: 1px dashed $pindou-border-light;
}

.eraser-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eraser-icon {
  font-size: 24px;
}

.eraser-title {
  display: block;
  font-weight: 600;
  font-size: $pindou-font-md;
}

.eraser-desc {
  display: block;
  margin-top: 2px;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.4;
}
</style>
