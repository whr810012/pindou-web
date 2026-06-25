<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import { showToast } from '@/utils/platform-ui'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import {
  applySuggestedParamsForImage,
  loadImageToProject,
  processCurrentProject,
} from '@/utils/pipeline'
import { createSourcePreview } from '@/utils/thumbnail'

const router = useRouter()
const paletteStore = usePaletteStore()
const project = useProjectStore()

const text = ref('PINDOU')
const scale = ref(10)
const processing = ref(false)

const fgId = ref('')
const bgId = ref('')

const fgEntry = computed(() => paletteStore.activeEntries.find((e) => e.id === fgId.value))
const bgEntry = computed(() => paletteStore.activeEntries.find((e) => e.id === bgId.value))

const previewCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  await paletteStore.loadPalettes()
  paletteStore.setPreset('pindou-full')
  const entries = paletteStore.activeEntries
  fgId.value = entries.find((e) => e.hex.toUpperCase() === '#111111')?.id ?? entries[0]?.id ?? ''
  bgId.value =
    entries.find((e) => e.hex.toUpperCase() === '#FFFFFF')?.id ??
    entries.find((e) => /^neutral-00/i.test(e.id))?.id ??
    entries[entries.length - 1]?.id ??
    ''
  renderPreview()
})

function renderPreview() {
  const canvas = previewCanvas.value
  if (!canvas) return
  const fg = fgEntry.value?.hex ?? '#111111'
  const bg = bgEntry.value?.hex ?? '#FFFFFF'
  const content = text.value.trim() || ' '
  const fontSize = 8
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = `${fontSize}px monospace`
  const textWidth = Math.ceil(measure.measureText(content).width) + 4
  const textHeight = fontSize + 4
  const cell = scale.value
  canvas.width = textWidth * cell
  canvas.height = textHeight * cell
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = fg
  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'
  ctx.scale(cell, cell)
  ctx.fillText(content, 2, 2)
}

function onInputChange() {
  renderPreview()
}

async function goWorkspace() {
  const canvas = previewCanvas.value
  if (!canvas || !text.value.trim()) {
    showToast({ title: '请输入文字', icon: 'none' })
    return
  }
  processing.value = true
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('生成图片失败')
    const path = URL.createObjectURL(blob)
    const loaded = await loadImageToProject(path)
    applySuggestedParamsForImage(loaded.width, loaded.height, loaded.pixels)
    paletteStore.setPreset('pindou-full')
    project.projectName = text.value.trim().slice(0, 20) || '像素文字'
    const preview = await createSourcePreview(path)
    project.setSourcePreview(preview)
    await processCurrentProject()
    showToast({ title: '已生成，进入工作台', icon: 'success' })
    router.push('/workspace')
  } catch (error) {
    console.error(error)
    showToast({ title: '生成失败', icon: 'none' })
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="page page--pixel-text page-enter">
    <header class="craft-page-head">
      <h1 class="craft-page-head__title">像素文字</h1>
      <p class="craft-page-head__sub">输入文字，用色板颜色渲染为像素图，一键进入工作台继续制作拼豆图纸。</p>
    </header>

    <section class="card editor">
      <label class="craft-field">
        <span class="craft-field__label">文字内容</span>
        <input
          v-model="text"
          class="craft-input"
          type="text"
          maxlength="32"
          placeholder="输入英文或数字"
          @input="onInputChange"
        />
      </label>

      <label class="craft-field">
        <span class="craft-field__label">像素倍率 {{ scale }}</span>
        <div class="craft-range-row">
          <input
            v-model.number="scale"
            class="craft-range"
            type="range"
            min="4"
            max="24"
            step="1"
            @input="onInputChange"
          />
          <span class="craft-range-val">{{ scale }}</span>
        </div>
      </label>

      <div class="colors">
        <div class="color-block">
          <span class="craft-field__label">文字色</span>
          <div class="swatch-row">
            <button
              v-for="entry in paletteStore.activeEntries.slice(0, 48)"
              :key="`fg-${entry.id}`"
              type="button"
              class="craft-swatch"
              :class="{ active: entry.id === fgId }"
              :style="{ backgroundColor: entry.hex }"
              :title="paletteStore.getDisplayCode(entry.id)"
              @click="fgId = entry.id; onInputChange()"
            />
          </div>
        </div>
        <div class="color-block">
          <span class="craft-field__label">背景色</span>
          <div class="swatch-row">
            <button
              v-for="entry in paletteStore.activeEntries.slice(0, 48)"
              :key="`bg-${entry.id}`"
              type="button"
              class="craft-swatch"
              :class="{ active: entry.id === bgId }"
              :style="{ backgroundColor: entry.hex }"
              :title="paletteStore.getDisplayCode(entry.id)"
              @click="bgId = entry.id; onInputChange()"
            />
          </div>
        </div>
      </div>

      <div class="craft-preview-frame preview-wrap">
        <canvas ref="previewCanvas" class="preview-canvas" />
      </div>

      <PButton
        type="primary"
        block
        :text="processing ? '生成中…' : '生成并进入工作台'"
        :disabled="processing"
        @click="goWorkspace"
      />
    </section>
  </div>
</template>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.colors {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.preview-wrap {
  display: flex;
  justify-content: center;
}

.preview-canvas {
  image-rendering: pixelated;
  max-width: 100%;
  box-shadow: $pindou-shadow-sm;
  border-radius: 4px;
}
</style>
