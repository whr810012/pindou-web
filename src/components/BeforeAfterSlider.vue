<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    beforeSrc: string
    afterSrc: string
    /** width / height，例如 4/3 或 0.655 */
    aspectRatio?: number
  }>(),
  {
    aspectRatio: 4 / 3,
  },
)

const boxId = `before-after-${Math.random().toString(36).slice(2, 9)}`
const split = ref(50)
const dragging = ref(false)
const dragRect = ref<{ left: number; width: number } | null>(null)

const wrapStyle = computed(() => ({
  aspectRatio: String(props.aspectRatio),
}))

const afterClipStyle = computed(() => ({
  clipPath: `polygon(${split.value}% 0%, 100% 0%, 100% 100%, ${split.value}% 100%)`,
}))

const dividerStyle = computed(() => ({
  left: `${split.value}%`,
}))

function measureBox(): { left: number; width: number } | null {
  const el = document.getElementById(boxId)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (!rect.width) return null
  return { left: rect.left, width: rect.width }
}

function applySplitFromClientX(clientX: number) {
  const rect = dragRect.value
  if (!rect?.width) return
  const pct = ((clientX - rect.left) / rect.width) * 100
  split.value = Math.max(0, Math.min(100, pct))
}

function beginDrag(clientX: number) {
  dragging.value = true
  dragRect.value = measureBox()
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

onUnmounted(() => {
  dragging.value = false
  dragRect.value = null
})
</script>

<template>
  <div
    :id="boxId"
    class="compare-slider"
    :class="{ 'compare-slider--dragging': dragging }"
    :style="wrapStyle"
    @touchstart.stop="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend.stop="onTouchEnd"
    @touchcancel.stop="onTouchEnd"
    @mousedown="onMouseDown"
  >
    <img class="compare-slider__img compare-slider__img--before" :src="beforeSrc" alt="处理前" />
    <img
      class="compare-slider__img compare-slider__img--after"
      :src="afterSrc"
      alt="处理后"
      :style="afterClipStyle"
    />
    <div class="compare-slider__divider" :style="dividerStyle" aria-hidden="true">
      <span class="compare-slider__handle" />
    </div>
    <input
      class="compare-slider__range"
      type="range"
      min="0"
      max="100"
      :value="split"
      aria-label="对比滑块"
      @input="onSplitInput"
    />
  </div>
</template>

<style scoped lang="scss">
.compare-slider {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: $pindou-radius-sm;
  background-color: #ece8e1;
  background-image:
    linear-gradient(45deg, #e0dbd3 25%, transparent 25%),
    linear-gradient(-45deg, #e0dbd3 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0dbd3 75%),
    linear-gradient(-45deg, transparent 75%, #e0dbd3 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  user-select: none;
  touch-action: none;
  cursor: ew-resize;
  border: 1px solid $pindou-border-light;
}

.compare-slider__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.compare-slider__img--after {
  z-index: 1;
}

.compare-slider__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 3px;
  margin-left: -1.5px;
  background: $pindou-primary;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.compare-slider__handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid $pindou-primary;
  box-shadow: $pindou-shadow-md;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    margin-top: -5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 8px;
    border-right-color: $pindou-primary;
  }

  &::after {
    right: 8px;
    border-left-color: $pindou-primary;
  }
}

.compare-slider__range {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.compare-slider--dragging {
  cursor: grabbing;
}
</style>
