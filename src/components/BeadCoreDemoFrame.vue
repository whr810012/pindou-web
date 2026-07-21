<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { DemoFrame } from '@/utils/beadCoreDocDemos'
import type { MappedGrid } from '@wangdandan810012/bead-core'
import {
  cellFromCanvasEvent,
  paintGridToCanvas,
  paintPixelsToCanvas,
} from '@/utils/beadCoreDocDemos'

const props = defineProps<{
  frame: DemoFrame
  showArrow?: boolean
  interactive?: boolean
}>()

const emit = defineEmits<{
  cellClick: [{ row: number; col: number }]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function paint() {
  const canvas = canvasRef.value
  if (!canvas || props.frame.kind === 'image') return
  const { frame } = props
  if (frame.kind === 'pixels' && frame.pixels) {
    paintPixelsToCanvas(canvas, frame.pixels, frame.width, frame.height)
  } else if (frame.kind === 'grid' && frame.grid) {
    paintGridToCanvas(canvas, frame.grid, 12)
  }
}

function onClick(event: MouseEvent) {
  if (!props.interactive || props.frame.kind !== 'grid' || !props.frame.grid || !canvasRef.value) {
    return
  }
  const cell = cellFromCanvasEvent(event, canvasRef.value, props.frame.grid as MappedGrid)
  if (cell) emit('cellClick', cell)
}

onMounted(paint)
watch(() => props.frame, paint, { flush: 'post' })
</script>

<template>
  <figure class="frame" :class="{ 'frame--interactive': interactive }">
    <div class="frame__visual">
      <img
        v-if="frame.kind === 'image' && frame.imageSrc"
        class="frame__img"
        :src="frame.imageSrc"
        :alt="frame.label"
        loading="lazy"
        decoding="async"
      />
      <canvas
        v-else
        ref="canvasRef"
        class="frame__canvas"
        width="1"
        height="1"
        role="img"
        :aria-label="interactive ? `${frame.label}，点击网格可编辑` : frame.label"
        :class="{ 'frame__canvas--clickable': interactive }"
        @click="onClick"
      />
      <span class="frame__size">{{ frame.width }}×{{ frame.height }}</span>
    </div>
    <figcaption class="frame__cap">
      <span class="frame__label">{{ frame.label }}</span>
      <span v-if="frame.caption" class="frame__sub">{{ frame.caption }}</span>
    </figcaption>
    <span v-if="showArrow" class="frame__arrow" aria-hidden="true">→</span>
  </figure>
</template>

<style scoped lang="scss">
.frame {
  position: relative;
  margin: 0;
  display: flex;
  flex: 1 1 150px;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-right: 14px;
}

.frame__visual {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 132px;
  place-items: center;
  padding: 9px;
  overflow: hidden;
  border: 1px solid $pindou-border-light;
  border-radius: 11px;
  background:
    linear-gradient(rgba($pindou-text, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba($pindou-text, 0.035) 1px, transparent 1px),
    $pindou-bg-subtle;
  background-size: 12px 12px;
}

.frame--interactive .frame__canvas--clickable {
  cursor: crosshair;
  outline: 2px solid transparent;
  transition: outline-color 0.15s;

  &:hover {
    outline-color: rgba($pindou-primary, 0.35);
  }
}

.frame__canvas,
.frame__img {
  display: block;
  width: auto;
  height: auto;
  max-width: min(100%, 210px);
  max-height: 172px;
  border-radius: 8px;
  border: 1px solid rgba($pindou-text, 0.08);
  background: #fff;
  box-shadow: 0 5px 16px rgba($pindou-text, 0.09);
  object-fit: contain;
}

.frame__canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.frame__cap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.frame__size {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 5px;
  border: 1px solid rgba($pindou-text, 0.06);
  border-radius: 6px;
  background: rgba($pindou-bg-card, 0.86);
  color: $pindou-text-hint;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: 8px;
  line-height: 1.35;
  backdrop-filter: blur(5px);
}

.frame__label {
  font-size: 12px;
  font-weight: 700;
  color: $pindou-text;
}

.frame__sub {
  font-size: 10px;
  color: $pindou-text-muted;
}

.frame__arrow {
  position: absolute;
  right: -2px;
  top: 68px;
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 1px solid rgba($pindou-primary, 0.14);
  border-radius: 50%;
  background: $pindou-bg-card;
  color: $pindou-primary;
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 520px) {
  .frame {
    flex-basis: 100%;
    padding-right: 0;
  }

  .frame__arrow {
    display: none;
  }
}
</style>
