<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MappedGrid } from '@pindou/bead-core'

const props = defineProps<{
  grid: MappedGrid | null
  row: number
  col: number
  cellSize?: number
  codeLookup?: (paletteId: string) => string
  visible: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const zoom = 4

const region = computed(() => {
  if (!props.grid) return null
  const rows = props.grid.length
  const cols = props.grid[0]?.length ?? 0
  const radius = 2
  const r0 = Math.max(0, props.row - radius)
  const c0 = Math.max(0, props.col - radius)
  const r1 = Math.min(rows - 1, props.row + radius)
  const c1 = Math.min(cols - 1, props.col + radius)
  return { r0, c0, r1, c1, rows, cols }
})

const cellInfo = computed(() => {
  if (!props.grid || !region.value) return null
  const cell = props.grid[props.row]?.[props.col]
  if (!cell) return null
  return {
    code: props.codeLookup?.(cell.paletteId) ?? cell.paletteId,
    hex: cell.hex,
  }
})

watch(
  () => [props.row, props.col, props.visible, props.grid, props.cellSize] as const,
  () => {
    if (props.visible) drawMagnifier()
  },
)

function drawMagnifier() {
  const canvas = canvasRef.value
  if (!props.visible || !props.grid || !region.value || !canvas) return
  const { r0, c0, r1, c1 } = region.value
  const cs = props.cellSize ?? 14
  const w = (c1 - c0 + 1) * cs * zoom
  const h = (r1 - r0 + 1) * cs * zoom
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f5f6fa'
  ctx.fillRect(0, 0, w, h)

  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      const cell = props.grid![row][col]
      const x = (col - c0) * cs * zoom
      const y = (row - r0) * cs * zoom
      ctx.fillStyle = cell.isExternal ? '#e8e8e8' : cell.hex
      ctx.fillRect(x, y, cs * zoom, cs * zoom)
      ctx.strokeStyle = row === props.row && col === props.col ? '#2979ff' : 'rgba(0,0,0,0.15)'
      ctx.lineWidth = row === props.row && col === props.col ? 3 : 1
      ctx.strokeRect(x, y, cs * zoom, cs * zoom)
    }
  }
}
</script>

<template>
  <div v-if="visible && cellInfo" class="magnifier">
    <canvas ref="canvasRef" class="magnifier-canvas" />
    <div class="magnifier-meta">
      <span>{{ cellInfo.code }}</span>
      <span>{{ cellInfo.hex }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.magnifier {
  position: fixed;
  top: 72px;
  right: 12px;
  z-index: 50;
  background: $pindou-bg-card;
  border-radius: $pindou-radius-md;
  padding: 8px;
  box-shadow: $pindou-shadow-md;
}

.magnifier-canvas {
  display: block;
  border-radius: 4px;
}

.magnifier-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  font-size: $pindou-font-sm;
}
</style>
