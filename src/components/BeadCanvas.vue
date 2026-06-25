<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { MappedGrid } from '@pindou/bead-core'
import { getImageAdapter } from '@/adapters'
import { drawGridCell, prepareCanvas, getSafeDpr } from '@/adapters/image-web'
import { observeElementWidth } from '@/utils/fitCellSize'
import type { RenderGridOptions } from '@/adapters/types'

const props = withDefaults(
  defineProps<{
    grid: MappedGrid | null
    cellSize?: number
    showGrid?: boolean
    highlightPaletteId?: string | null
    completedCells?: Set<string>
    codeLookup?: (paletteId: string) => string
    showColorCode?: boolean
    interactive?: boolean
    rectSelectMode?: boolean
    isZoneActive?: (row: number, col: number) => boolean
    enableViewport?: boolean
    viewScale?: number
    viewOffsetX?: number
    viewOffsetY?: number
    panEnabled?: boolean
    dragPaint?: boolean
    embedded?: boolean
    fillWidth?: boolean
    externalScroll?: boolean
    containerWidth?: number
    /** 空白格不画斜纹，专注拼豆等大图场景 */
    simpleExternal?: boolean
    /** 分区/高亮等触发全量重绘的键 */
    renderKey?: string
  }>(),
  {
    cellSize: 10,
    showGrid: true,
    highlightPaletteId: null,
    completedCells: () => new Set<string>(),
    showColorCode: false,
    interactive: false,
    rectSelectMode: false,
    enableViewport: false,
    viewScale: 1,
    viewOffsetX: 0,
    viewOffsetY: 0,
    panEnabled: false,
    dragPaint: false,
    embedded: false,
    fillWidth: false,
    externalScroll: false,
    containerWidth: 0,
    simpleExternal: false,
  },
)

const emit = defineEmits<{
  cellTap: [{ row: number; col: number }]
  cellLongPress: [{ row: number; col: number }]
  rectSelect: [{ row0: number; col0: number; row1: number; col1: number }]
  strokeEnd: []
  'update:viewScale': [scale: number]
  'update:viewOffset': [offset: { x: number; y: number }]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const fillHostRef = ref<HTMLElement | null>(null)
const tooltip = ref<{ row: number; col: number; code: string; hex: string } | null>(null)
const dragStart = ref<{ row: number; col: number } | null>(null)
const dragEnd = ref<{ row: number; col: number } | null>(null)
const lastPanTouch = ref<{ x: number; y: number } | null>(null)
const pointerDown = ref(false)
const lastPaintKey = ref('')
const measuredBoxWidth = ref(0)
let stopFillObserve: (() => void) | null = null
let prevCompletedCells: Set<string> = new Set()
let structureSignature = ''
let gridMutationRaf = 0

function buildRenderOptions(): RenderGridOptions {
  const layoutWidth = fillLayoutSize.value?.width ?? 0
  return {
    cellSize: renderCellSize.value,
    layoutWidth: layoutWidth > 0 ? layoutWidth : undefined,
    showGrid: props.showGrid,
    highlightPaletteId: props.highlightPaletteId,
    completedCells: props.completedCells,
    brandCodeLookup: props.codeLookup,
    showColorCode: props.showColorCode,
    isZoneActive: props.isZoneActive,
    simpleExternal: props.simpleExternal,
  }
}

function structureKey(): string {
  const g = props.grid
  if (!g?.length) return ''
  const cols = g[0]?.length ?? 0
  return [
    g,
    cols,
    g.length,
    renderCellSize.value,
    props.fillWidth,
    props.showGrid,
    props.showColorCode,
    props.highlightPaletteId,
    props.simpleExternal,
    props.isZoneActive ? 1 : 0,
    props.renderKey ?? '',
  ].join('|')
}

function parseCellKey(key: string): { row: number; col: number } | null {
  const comma = key.indexOf(',')
  if (comma < 0) return null
  const row = Number(key.slice(0, comma))
  const col = Number(key.slice(comma + 1))
  if (!Number.isFinite(row) || !Number.isFinite(col)) return null
  return { row, col }
}

function diffCompletedSets(prev: Set<string>, next: Set<string>): string[] {
  const changed: string[] = []
  for (const key of next) {
    if (!prev.has(key)) changed.push(key)
  }
  for (const key of prev) {
    if (!next.has(key)) changed.push(key)
  }
  return changed
}

function redrawCells(cellKeys: string[]) {
  const canvas = canvasRef.value
  if (!canvas || !props.grid || cellKeys.length === 0) return
  const cols = props.grid[0]?.length ?? 0
  const rows = props.grid.length
  const cellSize = renderCellSize.value
  const canvasW = cols * cellSize
  const canvasH = rows * cellSize
  const ctx = prepareCanvas(canvas, canvasW, canvasH, getSafeDpr())
  const options = buildRenderOptions()
  for (const key of cellKeys) {
    const pos = parseCellKey(key)
    if (!pos || pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) continue
    drawGridCell(ctx, props.grid, pos.row, pos.col, options, cellSize)
  }
}

function redraw() {
  const canvas = canvasRef.value
  if (!canvas || !props.grid) return
  getImageAdapter().renderGrid(canvas, props.grid, buildRenderOptions())
  prevCompletedCells = new Set(props.completedCells ?? [])
  structureSignature = structureKey()
}

const effectiveContainerWidth = computed(() => {
  if (!props.fillWidth) return 0
  return Math.max(measuredBoxWidth.value, props.containerWidth)
})

const fillLayoutSize = computed(() => {
  const cols = props.grid?.[0]?.length ?? 0
  const rows = props.grid?.length ?? 0
  const w = effectiveContainerWidth.value
  if (!props.fillWidth || cols <= 0 || rows <= 0 || w <= 0) return null
  const cell = w / cols
  return { width: w, height: rows * cell, cellSize: cell }
})

const renderCellSize = computed(() => {
  if (props.fillWidth && fillLayoutSize.value) {
    return Math.max(2, fillLayoutSize.value.cellSize)
  }
  const cols = props.grid?.[0]?.length ?? 0
  const width = effectiveContainerWidth.value
  if (props.fillWidth && width > 0 && cols > 0) {
    return Math.max(2, width / cols)
  }
  return props.cellSize
})

const canvasStyle = computed(() => {
  const cols = props.grid?.[0]?.length ?? 0
  const rows = props.grid?.length ?? 0
  const layout = fillLayoutSize.value
  if (layout) {
    return { width: `${layout.width}px`, height: `${layout.height}px`, display: 'block' }
  }
  const size = renderCellSize.value
  return { width: `${cols * size}px`, height: `${rows * size}px` }
})

const transformStyle = computed(() => {
  if (!props.enableViewport) return {}
  return {
    transform: `translate(${props.viewOffsetX}px, ${props.viewOffsetY}px) scale(${props.viewScale})`,
    transformOrigin: '0 0',
  }
})

const selectionStyle = computed(() => {
  if (!dragStart.value || !dragEnd.value) return null
  const r0 = Math.min(dragStart.value.row, dragEnd.value.row)
  const c0 = Math.min(dragStart.value.col, dragEnd.value.col)
  const r1 = Math.max(dragStart.value.row, dragEnd.value.row)
  const c1 = Math.max(dragStart.value.col, dragEnd.value.col)
  const cols = props.grid?.[0]?.length ?? 1
  const rows = props.grid?.length ?? 1
  if (props.fillWidth) {
    return {
      left: `${(c0 / cols) * 100}%`,
      top: `${(r0 / rows) * 100}%`,
      width: `${((c1 - c0 + 1) / cols) * 100}%`,
      height: `${((r1 - r0 + 1) / rows) * 100}%`,
    }
  }
  return {
    left: `${c0 * renderCellSize.value}px`,
    top: `${r0 * renderCellSize.value}px`,
    width: `${(c1 - c0 + 1) * renderCellSize.value}px`,
    height: `${(r1 - r0 + 1) * renderCellSize.value}px`,
  }
})

async function scheduleRedraw() {
  await nextTick()
  redraw()
}

function startFillWidthObserve() {
  if (!props.fillWidth) return
  stopFillObserve?.()
  stopFillObserve = observeElementWidth(fillHostRef.value, (w) => {
    if (w > 0 && Math.abs(w - measuredBoxWidth.value) > 0.5) {
      measuredBoxWidth.value = w
    }
  })
}

function cellFromPoint(clientX: number, clientY: number) {
  const canvas = canvasRef.value
  if (!canvas || !props.grid) return null
  const rect = canvas.getBoundingClientRect()
  let localX = clientX - rect.left
  let localY = clientY - rect.top
  // getBoundingClientRect 已包含父级 translate/scale，只需按缩放还原逻辑坐标
  if (props.enableViewport && props.viewScale !== 1) {
    localX /= props.viewScale
    localY /= props.viewScale
  }
  const size = renderCellSize.value
  const cols = props.grid[0].length
  const rows = props.grid.length
  const col = props.fillWidth
    ? Math.floor((localX / rect.width) * cols)
    : Math.floor(localX / size)
  const row = props.fillWidth
    ? Math.floor((localY / rect.height) * rows)
    : Math.floor(localY / size)
  if (row < 0 || col < 0 || row >= rows || col >= cols) return null
  return { row, col }
}

function updateTooltip(cell: { row: number; col: number }) {
  if (!props.grid) return
  const gridCell = props.grid[cell.row][cell.col]
  tooltip.value = {
    row: cell.row,
    col: cell.col,
    code: props.codeLookup?.(gridCell.paletteId) ?? gridCell.paletteId,
    hex: gridCell.hex,
  }
}

function paintCellAt(clientX: number, clientY: number, force = false) {
  const cell = cellFromPoint(clientX, clientY)
  if (!cell) return
  const key = `${cell.row},${cell.col}`
  if (!force && key === lastPaintKey.value) return
  lastPaintKey.value = key
  updateTooltip(cell)
  emit('cellTap', cell)
}

function resolveCellPoint(clientX: number, clientY: number) {
  if (!props.grid) return
  const cell = cellFromPoint(clientX, clientY)
  if (!cell) return
  if (props.rectSelectMode) {
    dragStart.value = cell
    dragEnd.value = cell
    return
  }
  lastPaintKey.value = ''
  paintCellAt(clientX, clientY, true)
}

defineExpose({ resolveTapAt: resolveCellPoint })

function finishRectSelect() {
  if (!props.rectSelectMode || !dragStart.value || !dragEnd.value) {
    dragStart.value = null
    dragEnd.value = null
    return
  }
  emit('rectSelect', {
    row0: dragStart.value.row,
    col0: dragStart.value.col,
    row1: dragEnd.value.row,
    col1: dragEnd.value.col,
  })
  dragStart.value = null
  dragEnd.value = null
}

function onPointerDown(event: PointerEvent) {
  if (!props.grid || !props.interactive) return
  const target = event.currentTarget as HTMLCanvasElement
  if (props.enableViewport && props.panEnabled) {
    lastPanTouch.value = { x: event.clientX, y: event.clientY }
    pointerDown.value = true
    target.setPointerCapture(event.pointerId)
    return
  }
  pointerDown.value = true
  lastPaintKey.value = ''
  target.setPointerCapture(event.pointerId)
  resolveCellPoint(event.clientX, event.clientY)
}

function onPointerMove(event: PointerEvent) {
  if (!props.interactive || !pointerDown.value) return

  if (lastPanTouch.value) {
    const dx = event.clientX - lastPanTouch.value.x
    const dy = event.clientY - lastPanTouch.value.y
    lastPanTouch.value = { x: event.clientX, y: event.clientY }
    emit('update:viewOffset', { x: props.viewOffsetX + dx, y: props.viewOffsetY + dy })
    return
  }

  if (props.rectSelectMode && dragStart.value) {
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (cell) dragEnd.value = cell
    return
  }

  if (props.dragPaint && !props.rectSelectMode) {
    paintCellAt(event.clientX, event.clientY)
  }
}

function onPointerUp(event: PointerEvent) {
  const wasPainting = pointerDown.value && props.dragPaint && !lastPanTouch.value
  if (pointerDown.value) {
    try {
      ;(event.currentTarget as HTMLCanvasElement).releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
  }
  pointerDown.value = false
  lastPanTouch.value = null
  lastPaintKey.value = ''
  finishRectSelect()
  if (wasPainting) emit('strokeEnd')
}

function onPointerLeave(event: PointerEvent) {
  // 按住拖动时 pointerleave 仍会触发，不应提前结束平移/涂抹
  if (pointerDown.value) return
  onPointerUp(event)
}

function onWheel(event: WheelEvent) {
  if (!props.enableViewport) return
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const next = Math.min(3, Math.max(0.35, props.viewScale * delta))
  emit('update:viewScale', next)
}

watch(
  () => [
    props.cellSize,
    props.fillWidth,
    props.containerWidth,
    measuredBoxWidth.value,
    props.showGrid,
    props.highlightPaletteId,
    props.showColorCode,
    props.simpleExternal,
    props.isZoneActive,
    props.renderKey,
  ],
  () => scheduleRedraw(),
)

/** 画笔/橡皮原地改格时 grid 引用不变，需 deep watch + rAF 合并重绘 */
watch(
  () => props.grid,
  () => {
    if (!props.grid) return
    if (gridMutationRaf) return
    gridMutationRaf = requestAnimationFrame(() => {
      gridMutationRaf = 0
      redraw()
    })
  },
  { deep: true },
)

watch(
  () => props.completedCells,
  (next) => {
    const cells = next ?? new Set<string>()
    if (structureKey() !== structureSignature || !canvasRef.value || !props.grid) {
      scheduleRedraw()
      return
    }
    const changed = diffCompletedSets(prevCompletedCells, cells)
    prevCompletedCells = new Set(cells)
    if (changed.length === 0) return
    if (changed.length <= 12) {
      redrawCells(changed)
      return
    }
    scheduleRedraw()
  },
)

watch(
  () => props.fillWidth,
  (enabled) => {
    if (enabled) startFillWidthObserve()
    else stopFillObserve?.()
  },
)

onMounted(async () => {
  startFillWidthObserve()
  await scheduleRedraw()
})

onUnmounted(() => {
  stopFillObserve?.()
  if (gridMutationRaf) cancelAnimationFrame(gridMutationRaf)
})
</script>

<template>
  <div
    ref="fillHostRef"
    class="bead-canvas-wrap"
    :class="{
      'bead-canvas-wrap--embedded': embedded,
      'bead-canvas-wrap--external-scroll': externalScroll,
    }"
  >
    <div class="bead-canvas-box" :style="transformStyle">
      <canvas
        ref="canvasRef"
        class="bead-canvas"
        :class="{
          'bead-canvas--no-pointer': externalScroll && !interactive,
          'bead-canvas--pan': panEnabled,
        }"
        :style="canvasStyle"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
        @wheel="onWheel"
      />
      <div v-if="selectionStyle" class="bead-selection" :style="selectionStyle" />
      <div v-if="tooltip && !rectSelectMode" class="bead-tooltip">
        <span>{{ tooltip.code }}</span>
        <span class="bead-tooltip__hex">{{ tooltip.hex }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bead-canvas-wrap {
  position: relative;
  width: 100%;

  &--embedded {
    overflow: hidden;
  }

  &--external-scroll {
    width: auto;
    display: inline-block;
  }
}

.bead-canvas-box {
  position: relative;
  display: inline-block;
}

.bead-canvas {
  display: block;
  touch-action: none;

  &--no-pointer {
    pointer-events: none;
  }

  &--pan {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.bead-selection {
  position: absolute;
  border: 2px solid $pindou-primary;
  background: rgba(41, 121, 255, 0.15);
  pointer-events: none;
}

.bead-tooltip {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  gap: 8px;
  pointer-events: none;

  &__hex {
    opacity: 0.8;
  }
}
</style>
