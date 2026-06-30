<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { MappedGrid } from '@wangdandan810012/bead-core'
import { getImageAdapter } from '@/adapters'

const props = withDefaults(
  defineProps<{
    grid: MappedGrid
    size?: number
  }>(),
  { size: 64 },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)

const cellSize = computed(() => {
  const rows = props.grid.length
  const cols = props.grid[0]?.length ?? 1
  return Math.max(1, Math.floor(props.size / Math.max(rows, cols)))
})

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  getImageAdapter().renderGrid(canvas, props.grid, {
    cellSize: cellSize.value,
    showGrid: false,
    showColorCode: false,
  })
}

onMounted(draw)
watch(() => props.grid, draw, { deep: true })
</script>

<template>
  <div class="thumb-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas ref="canvasRef" class="thumb-canvas" :style="{ width: size + 'px', height: size + 'px' }" />
  </div>
</template>

<style scoped lang="scss">
.thumb-wrap {
  border-radius: 6px;
  overflow: hidden;
  background: $pindou-bg-muted;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.thumb-canvas {
  display: block;
  image-rendering: pixelated;
}
</style>
