<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { drawCropToCanvas, previewImageStyle } from '@/utils/cropMath'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { showToast } from '@/utils/platform-ui'

const props = defineProps<{
  show: boolean
  imagePath: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [path: string]
}>()

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const imageMeta = ref({ width: 0, height: 0 })
const cropSize = 280
const outputSize = 1024
const lastTouch = ref<{ x: number; y: number } | null>(null)
const lastPinchDist = ref(0)

const previewStyle = computed(() => {
  const { width, height } = imageMeta.value
  if (!width) return {}
  return previewImageStyle(width, height, scale.value, offsetX.value, offsetY.value, cropSize)
})

watch(
  () => props.show,
  async (visible) => {
    if (!visible || !props.imagePath) return
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    await loadImageMeta()
  },
)

function loadImageMeta() {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      imageMeta.value = { width: img.width, height: img.height }
      resolve()
    }
    img.onerror = () => resolve()
    img.src = props.imagePath
  })
}

function touchDistance(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    lastPinchDist.value = touchDistance(e.touches)
    return
  }
  if (e.touches.length === 1) {
    lastTouch.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const dist = touchDistance(e.touches)
    if (lastPinchDist.value > 0) {
      scale.value = Math.min(Math.max(scale.value * (dist / lastPinchDist.value), 0.2), 3)
    }
    lastPinchDist.value = dist
    return
  }
  if (e.touches.length === 1 && lastTouch.value) {
    offsetX.value += e.touches[0].clientX - lastTouch.value.x
    offsetY.value += e.touches[0].clientY - lastTouch.value.y
    lastTouch.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}

function onTouchEnd() {
  lastTouch.value = null
  lastPinchDist.value = 0
}

function zoomIn() {
  scale.value = Math.min(scale.value * 1.2, 3)
}

function zoomOut() {
  scale.value = Math.max(scale.value / 1.2, 0.2)
}

async function confirmCrop() {
  try {
    const result = await cropImageH5(props.imagePath, scale.value, offsetX.value, offsetY.value)
    emit('confirm', result)
  } catch (error) {
    console.error(error)
    showToast({ title: '裁剪失败', icon: 'none' })
  }
}

function cropImageH5(
  src: string,
  scaleVal: number,
  offX: number,
  offY: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')!
      drawCropToCanvas(ctx, img, img.width, img.height, scaleVal, offX, offY, cropSize, outputSize)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}
</script>

<template>
  <PDrawer :model-value="show" title="裁剪图片" @update:model-value="(v) => !v && emit('close')">
    <p class="hint">拖动或双指缩放，调整裁剪区域</p>
    <div
      class="viewport"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <img
        v-if="imagePath && imageMeta.width"
        class="preview-img"
        :src="imagePath"
        :style="previewStyle"
        alt=""
      />
      <div class="mask" />
    </div>
    <div class="zoom-row">
      <PButton size="sm" @click="zoomOut">-</PButton>
      <PButton size="sm" @click="zoomIn">+</PButton>
    </div>
    <template #footer>
      <PButton @click="emit('close')">取消</PButton>
      <PButton type="primary" @click="confirmCrop">确定</PButton>
    </template>
  </PDrawer>
</template>

<style scoped lang="scss">
.hint {
  font-size: 11px;
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}

.viewport {
  width: 280px;
  height: 280px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  background: #222;
  border-radius: 8px;
}

.preview-img {
  display: block;
  max-width: none;
}

.mask {
  position: absolute;
  inset: 0;
  border: 2px dashed rgba(255, 255, 255, 0.8);
  pointer-events: none;
  box-sizing: border-box;
}

.zoom-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
}
</style>
