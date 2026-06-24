<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import PCell from '@/components/ui/PCell.vue'
import PSwitch from '@/components/ui/PSwitch.vue'
import PNumberBox from '@/components/ui/PNumberBox.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast, showModal, showActionSheet, setClipboardData, getSystemInfoSync, scanCode, chooseMessageFile, getFileSystemManager, request } from '@/utils/platform-ui'
import { computed, ref, watch } from 'vue'
import type { MappedGrid } from '@pindou/bead-core'
import BeadCanvas from '@/components/BeadCanvas.vue'
import { renderGridFitBox } from '@/utils/thumbnail'

const props = defineProps<{
  show: boolean
  sourceSrc: string
  grid: MappedGrid | null
  codeLookup?: (id: string) => string
}>()

const emit = defineEmits<{
  close: []
}>()

const compareBoxId = `compare-box-${Math.random().toString(36).slice(2, 9)}`

const split = ref(50)
const mode = ref<'compare' | 'source' | 'pattern'>('compare')
const patternSrc = ref('')
const useCanvasPattern = ref(false)
const dragging = ref(false)
const dragRect = ref<{ left: number; width: number } | null>(null)

const gridSize = computed(() => {
  if (!props.grid?.length) return null
  return { rows: props.grid.length, cols: props.grid[0].length }
})

const viewportSize = computed(() => {
  const meta = gridSize.value
  if (!meta) return { width: 280, height: 280 }
  const sys = getSystemInfoSync()
  const maxW = Math.min(sys.windowWidth - 48, 360)
  const maxH = 320
  const ratio = meta.cols / meta.rows
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  return { width: Math.floor(w), height: Math.floor(h) }
})

const boxStyle = computed(() => ({
  width: `${viewportSize.value.width}px`,
  height: `${viewportSize.value.height}px`,
}))

const patternClipStyle = computed(() => ({
  clipPath: `polygon(${split.value}% 0%, 100% 0%, 100% 100%, ${split.value}% 100%)`,
}))

const dividerStyle = computed(() => ({
  left: `${split.value}%`,
}))

const embeddedCellSize = computed(() => {
  const meta = gridSize.value
  if (!meta) return 8
  const { width, height } = viewportSize.value
  return Math.max(1, Math.floor(Math.min(width / meta.cols, height / meta.rows)))
})

function refreshPatternImage() {
  if (!props.grid) return
  const { width, height } = viewportSize.value
  const url = renderGridFitBox(props.grid, width, height, mode.value === 'pattern')
  if (url) {
    patternSrc.value = url
    useCanvasPattern.value = false
  } else {
    patternSrc.value = ''
    useCanvasPattern.value = true
  }
}

function applySplitFromClientX(clientX: number) {
  const rect = dragRect.value
  if (!rect?.width) return
  const pct = ((clientX - rect.left) / rect.width) * 100
  split.value = Math.max(0, Math.min(100, pct))
}

function measureCompareBox(): { left: number; width: number } | null {
  const el = document.getElementById(compareBoxId)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (!rect.width) return null
  return { left: rect.left, width: rect.width }
}

function beginDrag(clientX: number) {
  if (mode.value !== 'compare') return
  dragging.value = true
  dragRect.value = measureCompareBox()
  applySplitFromClientX(clientX)
}

function moveDrag(clientX: number) {
  if (!dragging.value) return
  applySplitFromClientX(clientX)
}

function endDrag() {
  dragging.value = false
  dragRect.value = null
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches?.[0]
  if (!touch) return
  beginDrag(touch.clientX)
}

function onTouchMove(e: TouchEvent) {
  if (!dragging.value) return
  const touch = e.touches?.[0]
  if (!touch) return
  moveDrag(touch.clientX)
}

function onTouchEnd() {
  endDrag()
}

function onMouseDown(e: MouseEvent) {
  beginDrag(e.clientX)
  const onMove = (ev: MouseEvent) => moveDrag(ev.clientX)
  const onUp = () => {
    endDrag()
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function onSplitInput(e: Event) {
  split.value = Number((e.target as HTMLInputElement).value)
}

watch(
  () => [props.show, props.grid, mode.value] as const,
  () => {
    if (!props.show || !props.grid) return
    refreshPatternImage()
  },
)

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    split.value = 50
    mode.value = 'compare'
    dragging.value = false
    dragRect.value = null
    refreshPatternImage()
  },
)
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="sheet">
      <span class="title">原图对比</span>
      <div class="tabs">
        <PTag
          text="对比"
          :plain="mode !== 'compare'"
          type="primary"
          @click="mode = 'compare'"
        />
        <PTag text="原图" :plain="mode !== 'source'" @click="mode = 'source'" />
        <PTag text="图纸" :plain="mode !== 'pattern'" @click="mode = 'pattern'" />
      </div>

      <div v-if="!sourceSrc || !grid" class="empty">需要原图与图纸才能对比</div>

      <div v-else class="compare-wrap">
        <div
          :id="compareBoxId"
          class="compare-box"
          :class="{ 'is-dragging': dragging, 'is-compare': mode === 'compare' }"
          :style="boxStyle"
          @touchstart.stop="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
          @mousedown="onMouseDown"
        >
          <img
            v-if="mode !== 'pattern'"
            class="layer source"
            :src="sourceSrc"
            
          />
          <img
            v-if="mode !== 'source' && !useCanvasPattern && patternSrc"
            class="layer pattern"
            :class="{ overlay: mode === 'compare' }"
            :style="mode === 'compare' ? patternClipStyle : undefined"
            :src="patternSrc"
            
          />
          <div
            v-else-if="mode !== 'source' && useCanvasPattern"
            class="layer pattern canvas-layer"
            :class="{ overlay: mode === 'compare' }"
            :style="mode === 'compare' ? patternClipStyle : undefined"
          >
            <BeadCanvas
              embedded
              :grid="grid"
              :cell-size="embeddedCellSize"
              :show-grid="mode === 'pattern'"
              :code-lookup="codeLookup"
            />
          </div>
          <div v-if="mode === 'compare'" class="divider" :style="dividerStyle">
            <div class="divider-handle" />
          </div>
        </div>
      </div>

      <div v-if="mode === 'compare' && grid" class="slider-row">
        <span class="label">原图</span>
        <input
          type="range"
          class="split-slider"
          :value="split"
          min="0"
          max="100"
          step="1"
          @input="onSplitInput"
        />
        <span class="label">图纸</span>
      </div>
      <span v-if="mode === 'compare' && grid" class="drag-hint">在图上左右滑动，或拖动下方滑条</span>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.sheet {
  padding: 16px;
  max-height: 85vh;
}

.title {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.compare-wrap {
  display: flex;
  justify-content: center;
}

.compare-box {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.compare-box.is-compare {
  cursor: ew-resize;
  touch-action: none;
  user-select: none;
}

.compare-box.is-dragging {
  cursor: grabbing;
}

.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pattern.overlay {
  z-index: 2;
}

.canvas-layer {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: $pindou-primary;
  z-index: 3;
  pointer-events: none;
}

.divider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border-radius: 50%;
  background: $pindou-primary;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.split-slider {
  flex: 1;
  accent-color: $pindou-primary;
  margin: 0;
}

.label {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
  width: 28px;
}

.drag-hint {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: #aaa;
  text-align: center;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 13px;
}
</style>
