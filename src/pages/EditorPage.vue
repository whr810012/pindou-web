<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MappedGrid } from '@wangdandan810012/bead-core'
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
const statusCollapsed = ref(false)
const guideDismissed = ref(false)
const GUIDE_KEY = 'pindou.editor.guide.dismissed'
const STATUS_KEY = 'pindou.editor.status.collapsed'

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

const replaceFromEntry = computed(() => {
  if (!editor.replaceFromId) return null
  return (
    paletteStore.activeEntries.find((e) => e.id === editor.replaceFromId) ??
    paletteStore.fullEntries.find((e) => e.id === editor.replaceFromId) ??
    null
  )
})

const replaceFromCode = computed(() =>
  editor.replaceFromId ? paletteStore.getDisplayCode(editor.replaceFromId) : '',
)

const statusHint = computed(() => {
  if (editor.tool === 'replace' && !editor.replaceFromId) {
    return '第 1 步：点击图纸上要替换的旧颜色（再点同色可取消）'
  }
  if (editor.tool === 'replace' && editor.replaceFromId) {
    return `第 2 步：在色板点选新色即可替换全图「${replaceFromCode.value}」`
  }
  if (panEnabled.value) {
    return '平移模式：拖动画布查看，点顶栏「平移」退出'
  }
  if (editor.tool === 'eraser') {
    return `擦除为空白背景（${eraserLabel.value}），不计入用豆`
  }
  return toolMeta.value.hint
})

const replaceModeActive = computed(
  () => editor.tool === 'replace' && !!editor.replaceFromId,
)

onMounted(async () => {
  guideDismissed.value = localStorage.getItem(GUIDE_KEY) === '1'
  statusCollapsed.value = localStorage.getItem(STATUS_KEY) === '1'
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

function toggleStatusCollapsed() {
  statusCollapsed.value = !statusCollapsed.value
  localStorage.setItem(STATUS_KEY, statusCollapsed.value ? '1' : '0')
}

function leaveEditor() {
  if (editor.canUndo) {
    showToast({ title: '可稍后在项目中继续编辑', icon: 'none' })
  }
  router.push('/workspace')
}

function goBack() {
  leaveEditor()
}

function commitGridChange(next: MappedGrid, label: string) {
  if (!project.grid) return
  editor.pushHistory(project.grid, label)
  project.setGrid(next)
}

function applyReplace(toId: string, toHex: string) {
  if (!project.grid || !editor.replaceFromId) return
  if (editor.replaceFromId === toId) {
    editor.replaceFromId = ''
    showToast({ title: '已取消换色（新旧色相同）', icon: 'none' })
    return
  }
  const updated = replaceColorInGrid(project.grid, editor.replaceFromId, toId, toHex)
  commitGridChange(updated, '换色')
  editor.replaceFromId = ''
  showToast({ title: '全图换色完成', icon: 'success' })
}

function applyCell(row: number, col: number) {
  if (!project.grid) return
  const cell = project.grid[row][col]

  if (editor.tool === 'eraser') {
    if (cell.isExternal) return
    const entry = eraserEntry.value
    if (!entry) {
      showToast({ title: '未找到背景色，请切换全色系色板', icon: 'none' })
      return
    }
    editor.beginStroke(project.grid, '橡皮')
    project.eraseCell(row, col, entry.id, normalizePaletteHex(entry.hex))
    return
  }

  if (editor.tool === 'brush') {
    if (!editor.selectedPaletteId) {
      showToast({ title: '请先在色板选择颜色', icon: 'none' })
      return
    }
    if (
      !cell.isExternal &&
      cell.paletteId === editor.selectedPaletteId &&
      normalizePaletteHex(cell.hex) === normalizePaletteHex(editor.selectedHex)
    ) {
      return
    }
    editor.beginStroke(project.grid, '画笔')
    project.updateCell(row, col, editor.selectedPaletteId, editor.selectedHex)
    return
  }

  if (cell.isExternal) return

  if (editor.tool === 'picker') {
    editor.selectColor(cell.paletteId, cell.hex)
    showToast({ title: `已吸取 ${paletteStore.getDisplayCode(cell.paletteId)}`, icon: 'none' })
    return
  }

  if (editor.tool === 'fill') {
    if (!editor.selectedPaletteId) {
      showToast({ title: '请先在色板选择颜色', icon: 'none' })
      return
    }
    if (cell.paletteId === editor.selectedPaletteId) return
    const filled = fillRegion(
      project.grid,
      row,
      col,
      editor.selectedPaletteId,
      editor.selectedHex,
    )
    commitGridChange(filled, '填充')
    return
  }

  if (editor.tool === 'replace' && editor.replaceFromId) {
    if (!editor.selectedPaletteId) {
      showToast({ title: '请先在色板选择新颜色', icon: 'none' })
      return
    }
    applyReplace(editor.selectedPaletteId, editor.selectedHex)
  }
}

function onRectSelect({ row0, col0, row1, col1 }: { row0: number; col0: number; row1: number; col1: number }) {
  if (!project.grid) return
  if (!editor.selectedPaletteId) {
    showToast({ title: '请先在色板选择颜色', icon: 'none' })
    return
  }
  const painted = paintRect(
    project.grid,
    row0,
    col0,
    row1,
    col1,
    editor.selectedPaletteId,
    editor.selectedHex,
  )
  commitGridChange(painted, '框选')
  showToast({ title: '已填充选区', icon: 'success' })
}

function onCellTap({ row, col }: { row: number; col: number }) {
  if (editor.tool === 'rect') return
  if (!project.grid) return
  const cell = project.grid[row][col]

  if (editor.tool === 'replace' && !editor.replaceFromId) {
    if (cell.isExternal) return
    editor.replaceFromId = cell.paletteId
    const code = paletteStore.getDisplayCode(editor.replaceFromId)
    showToast({ title: `已选旧色 ${code}，请选新色`, icon: 'none' })
    return
  }

  if (editor.tool === 'replace' && editor.replaceFromId) {
    if (cell.isExternal) return
    if (cell.paletteId === editor.replaceFromId) {
      editor.replaceFromId = ''
      showToast({ title: '已取消换色', icon: 'none' })
      return
    }
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
  showToast({ title: '已清空历史', icon: 'none' })
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
  applyReplace(entry.id, entry.hex)
}

function togglePan() {
  panEnabled.value = !panEnabled.value
}

function onViewOffset(offset: { x: number; y: number }) {
  viewOffset.value = offset
}

function flipHorizontal() {
  if (!project.grid) return
  commitGridChange(flipGridHorizontal(project.grid), '水平翻转')
  showToast({ title: '已水平翻转', icon: 'success' })
}

function flipVertical() {
  if (!project.grid) return
  commitGridChange(flipGridVertical(project.grid), '垂直翻转')
  showToast({ title: '已垂直翻转', icon: 'success' })
}

function changeTool(tool: typeof editor.tool) {
  editor.setTool(tool)
  if (tool !== 'replace') editor.replaceFromId = ''
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
    if (editor.replaceFromId) {
      editor.replaceFromId = ''
      showToast({ title: '已取消换色', icon: 'none' })
      return
    }
    goBack()
    return
  }
  if (toolMap[key]) {
    changeTool(toolMap[key])
  }
}
</script>

<template>
  <div class="page page--editor">
    <header class="craft-editor-bar">
      <button type="button" class="craft-editor-back" @click="goBack">← 工作台</button>
      <div class="editor-title">
        <span class="name">{{ project.projectName }}</span>
        <span v-if="grid" class="meta">{{ grid[0]?.length }}×{{ grid.length }} 格</span>
      </div>
      <PButton size="mini" plain text="完成" @click="goBack" />
    </header>

    <div v-if="!grid" class="empty-state">
      <p>请先在「工作台」上传图片并生成图纸</p>
      <PButton type="primary" text="去工作台" @click="goBack" />
    </div>

    <template v-else>
      <div
        class="status-bar"
        :class="{
          'status-bar--warn': editor.tool === 'replace',
          'status-bar--collapsed': statusCollapsed,
        }"
      >
        <button type="button" class="status-bar__main" @click="toggleStatusCollapsed">
          <span class="status-bar__icon">{{ toolMeta.icon }}</span>
          <span class="status-bar__body">
            <span class="status-bar__title">
              {{ toolMeta.label }}
              <span v-if="toolMeta.shortcut" class="status-bar__kbd">{{ toolMeta.shortcut }}</span>
            </span>
            <span v-if="!statusCollapsed" class="status-bar__hint">{{ statusHint }}</span>
            <span
              v-if="!statusCollapsed && !guideDismissed"
              class="status-bar__guide"
            >
              色板选色后点击或拖动画布；滚轮缩放，开启「平移」可移动视图。
              <button type="button" class="status-bar__guide-dismiss" @click.stop="dismissGuide">
                知道了
              </button>
            </span>
          </span>
          <span class="status-bar__chevron">{{ statusCollapsed ? '▾' : '▴' }}</span>
        </button>
        <div v-if="replaceModeActive && !statusCollapsed" class="status-bar__replace">
          <span
            class="status-bar__swatch"
            :style="{ backgroundColor: replaceFromEntry?.hex || '#ccc' }"
          />
          <span>旧色 {{ replaceFromCode }}</span>
          <span class="status-bar__arrow">→</span>
          <span>点色板完成替换</span>
        </div>
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
        <PButton size="mini" plain text="↔ 水平翻转" @click="flipHorizontal" />
        <PButton size="mini" plain text="↕ 垂直翻转" @click="flipVertical" />
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

      <div class="editor-dock">
        <FloatingPalette
          v-if="editor.tool !== 'eraser'"
          :entries="paletteStore.activeEntries"
          :selected-id="editor.selectedPaletteId"
          :selected-hex="editor.selectedHex"
          :replace-mode="replaceModeActive"
          :replace-from-code="replaceFromCode"
          :replace-from-hex="replaceFromEntry?.hex || ''"
          :code-lookup="(id) => paletteStore.getDisplayCode(id)"
          @select="onPaletteSelect"
        />
        <div v-else class="eraser-bar">
          <div class="eraser-preview">
            <span class="eraser-icon">🧹</span>
            <div>
              <span class="eraser-title">橡皮模式</span>
              <span class="eraser-desc">擦成空白，色号 {{ eraserLabel }}</span>
            </div>
          </div>
        </div>
        <FloatingToolbar
          :tool="editor.tool"
          :can-undo="editor.canUndo"
          :can-redo="editor.canRedo"
          :history-count="editor.snapshotCount"
          @change="changeTool"
          @undo="undo"
          @redo="redo"
          @history="historyVisible = true"
        />
      </div>
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

.status-bar {
  margin-bottom: $pindou-space-sm;
  background: $pindou-bg-card;
  border-radius: $pindou-radius-sm;
  border: 1px solid $pindou-border-light;
  overflow: hidden;
}

.status-bar--warn {
  background: $pindou-warning-bg;
  border-color: transparent;
}

.status-bar__main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.status-bar__icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1.3;
}

.status-bar__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-bar__title {
  font-size: $pindou-font-sm;
  font-weight: 700;
  color: $pindou-text;
}

.status-bar--warn .status-bar__title {
  color: $pindou-warning;
}

.status-bar__kbd {
  display: inline-block;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.06);
  color: $pindou-text-muted;
  vertical-align: middle;
}

.status-bar__hint {
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
  line-height: 1.45;
}

.status-bar--warn .status-bar__hint {
  color: $pindou-warning;
}

.status-bar__guide {
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.4;
}

.status-bar__guide-dismiss {
  margin-left: 6px;
  border: none;
  background: transparent;
  color: $pindou-primary;
  font-size: $pindou-font-xs;
  cursor: pointer;
  white-space: nowrap;
}

.status-bar__chevron {
  flex-shrink: 0;
  color: $pindou-text-muted;
  font-size: 12px;
  line-height: 1.6;
}

.status-bar__replace {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 10px;
  font-size: $pindou-font-xs;
  color: $pindou-warning;
}

.status-bar__swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.status-bar__arrow {
  opacity: 0.7;
}

.canvas-area {
  overflow: auto;
  max-height: calc(100vh - 300px);
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  padding: 8px;
  margin-bottom: calc(260px + var(--pindou-safe-bottom, 0px));

  @media (max-width: 640px) {
    max-height: calc(100vh - 280px);
    margin-bottom: calc(280px + var(--pindou-safe-bottom, 0px));
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
}

.editor-dock {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(#{$pindou-space-lg} + var(--pindou-safe-bottom, 0px));
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: $pindou-content-max;
  margin: 0 auto;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.eraser-bar {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
