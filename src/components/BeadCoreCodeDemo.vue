<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MappedGrid, PaletteEntry, PixelationMode } from '@wangdandan810012/bead-core'
import BeadCoreDemoFrame from '@/components/BeadCoreDemoFrame.vue'
import type { DemoAssets, DemoFrame } from '@/utils/beadCoreDocDemos'
import {
  applyEditFill,
  applyEditPaint,
  buildPipelineDemo,
  buildPrepDemo,
  buildPreprocessDemo,
  createEditBaseGrid,
  ensureDemoAssets,
} from '@/utils/beadCoreDocDemos'

const props = defineProps<{
  variant: 'palette' | 'pipeline' | 'preprocess' | 'prep' | 'edit' | 'browser'
  title?: string
  hint?: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const assets = ref<DemoAssets | null>(null)
const loadError = ref('')
const loading = ref(false)
const waiting = ref(true)
const showCode = ref(false)
const copied = ref(false)
let observer: IntersectionObserver | null = null
let copyTimer: ReturnType<typeof setTimeout> | null = null

/** —— Pipeline / Browser —— */
const gridWidth = ref(24)
const mode = ref<PixelationMode>('average')
const mergeThreshold = ref(6)
const maxColors = ref(0)
const markBackground = ref(true)

/** —— Preprocess —— */
const brightness = ref(0)
const contrast = ref(8)
const saturation = ref(0)
const sharpen = ref(true)
const denoise = ref(false)

/** —— Prep —— */
const maxGrid = ref(24)

/** —— Edit —— */
const editTool = ref<'fill' | 'paint'>('fill')
const editColorId = ref('')
const editGrid = ref<MappedGrid | null>(null)

const paletteSwatches = computed<PaletteEntry[]>(() => {
  if (!assets.value) return []
  if (props.variant === 'palette') {
    return assets.value.palette.slice(0, 24)
  }
  return assets.value.editSwatches
})

const selectedEntry = computed(
  () =>
    paletteSwatches.value.find((e) => e.id === editColorId.value) ??
    assets.value?.editSwatches[0] ??
    paletteSwatches.value[0],
)

const selectedPaletteId = ref('')

const runState = computed(() => {
  if (waiting.value) return '等待进入视区'
  if (loading.value) return '正在准备'
  if (loadError.value) return '加载失败'
  return '实时运行'
})

const playground = computed(() => {
  if (!assets.value) {
    return {
      frames: [] as DemoFrame[],
      footer: '',
      snippet: '',
      error: '',
      interactive: false,
    }
  }

  try {
    if (props.variant === 'palette') {
      return {
        frames: [] as DemoFrame[],
        footer: '色块来自落地页同款 pindou-full；配色时传入完整 PaletteEntry[]',
        snippet: '',
        error: '',
        interactive: false,
      }
    }

    if (props.variant === 'pipeline' || props.variant === 'browser') {
      const result = buildPipelineDemo({
        gridWidth: gridWidth.value,
        mode: mode.value,
        mergeThreshold: mergeThreshold.value,
        maxColors: maxColors.value,
        markBackground: markBackground.value,
      })
      return {
        frames: result.frames,
        footer: result.statsText,
        snippet: result.snippet,
        error: '',
        interactive: false,
      }
    }

    if (props.variant === 'preprocess') {
      const result = buildPreprocessDemo({
        brightness: brightness.value,
        contrast: contrast.value,
        saturation: saturation.value,
        sharpen: sharpen.value,
        denoise: denoise.value,
      })
      return {
        frames: result.frames,
        footer: '原图为落地页对比图；拖动滑块看预处理差异',
        snippet: result.snippet,
        error: '',
        interactive: false,
      }
    }

    if (props.variant === 'prep') {
      const result = buildPrepDemo({ maxGrid: maxGrid.value })
      return {
        frames: result.frames,
        footer: '调 maxGrid 观察中间图与 flatTile 豆图粒度',
        snippet: result.snippet,
        error: '',
        interactive: false,
      }
    }

    if (props.variant === 'edit' && editGrid.value) {
      const g = editGrid.value
      return {
        frames: [
          {
            label: '点击编辑',
            kind: 'grid' as const,
            width: g[0]?.length ?? 0,
            height: g.length,
            grid: g,
            caption: editTool.value === 'fill' ? '油漆桶：点同色连通区' : '画笔：点单格上色',
          },
        ],
        footer: '选工具与颜色后，直接点画布试效果；可重置',
        snippet:
          editTool.value === 'fill'
            ? `fillRegion(grid, row, col, '${selectedEntry.value?.id}', '${selectedEntry.value?.hex}')`
            : `paintRect(grid, row, col, row, col, '${selectedEntry.value?.id}', '${selectedEntry.value?.hex}')`,
        error: '',
        interactive: true,
      }
    }

    return { frames: [] as DemoFrame[], footer: '', snippet: '', error: '', interactive: false }
  } catch (e) {
    return {
      frames: [] as DemoFrame[],
      footer: '',
      snippet: '',
      error: e instanceof Error ? e.message : '演示运行失败',
      interactive: false,
    }
  }
})

function resetEdit() {
  if (!assets.value) return
  editGrid.value = createEditBaseGrid()
}

function resetControls() {
  if (props.variant === 'palette') {
    selectedPaletteId.value = assets.value?.palette[0]?.id ?? ''
    return
  }
  if (props.variant === 'pipeline' || props.variant === 'browser') {
    gridWidth.value = 24
    mode.value = 'average'
    mergeThreshold.value = 6
    maxColors.value = 0
    markBackground.value = true
    return
  }
  if (props.variant === 'preprocess') {
    brightness.value = 0
    contrast.value = 8
    saturation.value = 0
    sharpen.value = true
    denoise.value = false
    return
  }
  if (props.variant === 'prep') {
    maxGrid.value = 24
    return
  }
  editTool.value = 'fill'
  editColorId.value = assets.value?.editSwatches[1]?.id ?? assets.value?.editSwatches[0]?.id ?? ''
  resetEdit()
}

function applyPipelinePreset(preset: 'photo' | 'pixel') {
  if (preset === 'photo') {
    mode.value = 'average'
    gridWidth.value = 24
    mergeThreshold.value = 6
    maxColors.value = 0
  } else {
    mode.value = 'dominant'
    gridWidth.value = 30
    mergeThreshold.value = 2
    maxColors.value = 16
  }
}

async function copySnippet() {
  if (!playground.value.snippet) return
  try {
    await navigator.clipboard.writeText(playground.value.snippet)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}

function onEditCell({ row, col }: { row: number; col: number }) {
  if (!editGrid.value || !selectedEntry.value) return
  const entry = selectedEntry.value
  editGrid.value =
    editTool.value === 'fill'
      ? applyEditFill(editGrid.value, row, col, entry.id, entry.hex)
      : applyEditPaint(editGrid.value, row, col, entry.id, entry.hex)
}

async function loadAssets() {
  if (assets.value || loading.value) return
  waiting.value = false
  loading.value = true
  loadError.value = ''
  try {
    const loaded = await ensureDemoAssets(160)
    assets.value = loaded
    selectedPaletteId.value = loaded.editSwatches[0]?.id ?? loaded.palette[0]?.id ?? ''
    editColorId.value = loaded.editSwatches[1]?.id ?? loaded.editSwatches[0]?.id ?? ''
    if (props.variant === 'edit') resetEdit()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '演示资源加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!('IntersectionObserver' in window) || !rootRef.value) {
    void loadAssets()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      observer = null
      void loadAssets()
    },
    { rootMargin: '320px 0px' },
  )
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (copyTimer) clearTimeout(copyTimer)
})

watch(
  () => props.variant,
  (v) => {
    if (v === 'edit' && assets.value) resetEdit()
  },
)
</script>

<template>
  <div ref="rootRef" class="playground" :aria-label="title || '交互演示'">
    <div class="playground__head">
      <div class="playground__heading">
        <span class="playground__badge">Playground</span>
        <strong class="playground__title">{{ title || '可交互演示' }}</strong>
      </div>
      <div class="playground__head-actions">
        <span class="playground__run-state" aria-live="polite">
          <i aria-hidden="true" />
          {{ runState }}
        </span>
        <button
          v-if="assets"
          type="button"
          class="playground__reset"
          @click="resetControls"
        >
          恢复默认
        </button>
      </div>
    </div>
    <p v-if="hint" class="playground__hint">{{ hint }}</p>

    <div v-if="waiting" class="playground__status playground__status--waiting">
      <span class="playground__status-icon" aria-hidden="true">◎</span>
      演示将在滚动到附近时自动加载
    </div>
    <div v-if="loading" class="playground__status">正在加载落地页对比图与色板…</div>
    <div v-else-if="loadError" class="playground__status playground__status--error">
      {{ loadError }}
      <button type="button" @click="loadAssets">重试</button>
    </div>

    <div v-else-if="assets" class="playground__body">
      <!-- Controls -->
      <aside class="controls" aria-label="参数控件">
        <template v-if="variant === 'palette'">
          <p class="controls__label">色板预览（节选）</p>
          <div class="swatch-grid">
            <button
              v-for="entry in paletteSwatches"
              :key="entry.id"
              type="button"
              class="swatch"
              :class="{ active: selectedPaletteId === entry.id }"
              :aria-label="`选择色号 ${entry.id}，${entry.codes?.MARD || entry.hex}`"
              :aria-pressed="selectedPaletteId === entry.id"
              @click="selectedPaletteId = entry.id"
            >
              <span class="swatch__color" :style="{ backgroundColor: entry.hex }" />
              <span class="swatch__meta">
                <span class="swatch__id">{{ entry.id }}</span>
                <span class="swatch__hex">{{ entry.codes?.MARD || entry.hex }}</span>
              </span>
            </button>
          </div>
        </template>

        <template v-else-if="variant === 'pipeline' || variant === 'browser'">
          <div class="preset-row" aria-label="参数预设">
            <button type="button" @click="applyPipelinePreset('photo')">照片柔和</button>
            <button type="button" @click="applyPipelinePreset('pixel')">像素硬边</button>
          </div>
          <label class="field">
            <span>gridWidth <em>{{ gridWidth }}</em></span>
            <input v-model.number="gridWidth" name="gridWidth" type="range" min="12" max="40" step="1" />
          </label>
          <label class="field">
            <span>mode</span>
            <select v-model="mode" name="mode">
              <option value="average">average（照片）</option>
              <option value="dominant">dominant（卡通）</option>
            </select>
          </label>
          <label class="field">
            <span>mergeThreshold <em>{{ mergeThreshold }}</em></span>
            <input v-model.number="mergeThreshold" name="mergeThreshold" type="range" min="0" max="20" step="1" />
          </label>
          <label class="field">
            <span>maxColors <em>{{ maxColors || '不限' }}</em></span>
            <input v-model.number="maxColors" name="maxColors" type="range" min="0" max="24" step="1" />
          </label>
          <label class="field field--row">
            <input v-model="markBackground" name="markBackground" type="checkbox" />
            <span>标记背景色</span>
          </label>
        </template>

        <template v-else-if="variant === 'preprocess'">
          <label class="field">
            <span>brightness <em>{{ brightness }}</em></span>
            <input v-model.number="brightness" name="brightness" type="range" min="-30" max="30" step="1" />
          </label>
          <label class="field">
            <span>contrast <em>{{ contrast }}</em></span>
            <input v-model.number="contrast" name="contrast" type="range" min="0" max="40" step="1" />
          </label>
          <label class="field">
            <span>saturation <em>{{ saturation }}</em></span>
            <input v-model.number="saturation" name="saturation" type="range" min="-20" max="40" step="1" />
          </label>
          <label class="field field--row">
            <input v-model="sharpen" name="sharpen" type="checkbox" />
            <span>sharpen</span>
          </label>
          <label class="field field--row">
            <input v-model="denoise" name="denoise" type="checkbox" />
            <span>denoise</span>
          </label>
        </template>

        <template v-else-if="variant === 'prep'">
          <label class="field">
            <span>maxGrid <em>{{ maxGrid }}</em></span>
            <input v-model.number="maxGrid" name="maxGrid" type="range" min="12" max="40" step="1" />
          </label>
          <p class="controls__note">数值越小色块越大，豆图越「粗」</p>
        </template>

        <template v-else-if="variant === 'edit'">
          <p class="controls__label">工具</p>
          <div class="tool-row">
            <button
              type="button"
              class="tool-btn"
              :class="{ active: editTool === 'fill' }"
              @click="editTool = 'fill'"
            >
              填充
            </button>
            <button
              type="button"
              class="tool-btn"
              :class="{ active: editTool === 'paint' }"
              @click="editTool = 'paint'"
            >
              画笔
            </button>
            <button type="button" class="tool-btn tool-btn--ghost" @click="resetEdit">重置</button>
          </div>
          <p class="controls__label">颜色</p>
          <div class="color-row">
            <button
              v-for="entry in paletteSwatches"
              :key="entry.id"
              type="button"
              class="color-chip"
              :class="{ active: editColorId === entry.id }"
              :style="{ backgroundColor: entry.hex }"
              :title="entry.id"
              :aria-label="`选择编辑颜色 ${entry.id}`"
              :aria-pressed="editColorId === entry.id"
              @click="editColorId = entry.id"
            />
          </div>
        </template>
      </aside>

      <!-- Preview -->
      <div class="preview">
        <div v-if="playground.frames.length" class="preview__frames">
          <BeadCoreDemoFrame
            v-for="(frame, index) in playground.frames"
            :key="`${frame.label}-${index}-${frame.caption || ''}`"
            :frame="frame"
            :show-arrow="index < playground.frames.length - 1"
            :interactive="playground.interactive && frame.kind === 'grid'"
            @cell-click="onEditCell"
          />
        </div>
        <div v-else-if="variant === 'palette'" class="preview__palette-tip">
          <div
            class="preview__swatch-lg"
            :style="{
              backgroundColor:
                paletteSwatches.find((e) => e.id === selectedPaletteId)?.hex || '#ccc',
            }"
          />
          <p>
            当前选中
            <code>{{ selectedPaletteId }}</code>
            <span>{{ paletteSwatches.find((e) => e.id === selectedPaletteId)?.hex }}</span>
          </p>
        </div>
        <p v-if="playground.footer" class="preview__footer">{{ playground.footer }}</p>
        <p v-if="playground.error" class="preview__error">{{ playground.error }}</p>
      </div>
    </div>

    <div v-if="!loading && playground.snippet" class="playground__code">
      <div class="playground__codebar">
        <button
          type="button"
          :aria-expanded="showCode"
          @click="showCode = !showCode"
        >
          <span aria-hidden="true">{{ showCode ? '−' : '+' }}</span>
          {{ showCode ? '收起调用代码' : '查看调用代码' }}
        </button>
        <button type="button" class="playground__copy" @click="copySnippet">
          {{ copied ? '已复制' : '复制代码' }}
        </button>
      </div>
      <pre v-show="showCode" class="playground__snippet"><code>{{ playground.snippet }}</code></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.playground {
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba($pindou-primary, 0.14);
  background:
    linear-gradient(145deg, rgba($pindou-primary-light, 0.34), transparent 38%),
    $pindou-bg-card;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba($pindou-text, 0.07);
}

.playground__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid $pindou-border-light;
  background: rgba($pindou-bg-card, 0.72);
  backdrop-filter: blur(10px);
}

.playground__heading,
.playground__head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.playground__heading {
  flex-wrap: wrap;
}

.playground__head-actions {
  flex-shrink: 0;
}

.playground__badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.12);
  color: $pindou-primary;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.playground__title {
  font-size: $pindou-font-sm;
  color: $pindou-text;
}

.playground__run-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: $pindou-text-muted;
  font-size: 9px;
  font-weight: 600;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $pindou-success;
    box-shadow: 0 0 0 3px rgba($pindou-success, 0.1);
  }
}

.playground__reset {
  padding: 4px 8px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-card;
  color: $pindou-text-muted;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: rgba($pindou-primary, 0.3);
    color: $pindou-primary;
  }
}

.playground__hint {
  margin: 0;
  padding: 10px 14px 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.5;
}

.playground__status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 84px;
  padding: 20px 14px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;

  &--waiting {
    color: $pindou-text-hint;
  }

  &--error {
    color: #b91c1c;
  }

  button {
    margin-left: auto;
    padding: 5px 10px;
    border: 1px solid currentColor;
    border-radius: $pindou-radius-pill;
    background: transparent;
    color: inherit;
    font-size: 10px;
    cursor: pointer;
  }
}

.playground__status-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 9px;
  background: rgba($pindou-primary, 0.08);
  color: $pindou-primary;
}

.playground__body {
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: 0;
  min-height: 180px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.controls {
  padding: 12px 14px 14px;
  border-right: 1px solid $pindou-border-light;
  background:
    linear-gradient(rgba($pindou-text, 0.025) 1px, transparent 1px),
    rgba($pindou-bg-muted, 0.28);
  background-size: 16px 16px;

  @media (max-width: 640px) {
    border-right: none;
    border-bottom: 1px solid $pindou-border-light;
  }
}

.controls__label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: $pindou-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.controls__note {
  margin: 6px 0 0;
  font-size: 11px;
  color: $pindou-text-muted;
  line-height: 1.4;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  color: $pindou-text;

  span {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  em {
    font-style: normal;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 11px;
    color: $pindou-primary;
    font-weight: 700;
  }

  input[type='range'] {
    width: 100%;
    accent-color: $pindou-primary;
    cursor: ew-resize;
  }

  select {
    height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid $pindou-border-light;
    background: #fff;
    font-size: 12px;
  }
}

.preset-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 12px;

  button {
    padding: 7px 6px;
    border: 1px solid rgba($pindou-primary, 0.15);
    border-radius: 8px;
    background: rgba($pindou-primary-light, 0.7);
    color: $pindou-primary-dark;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      border-color: rgba($pindou-primary, 0.35);
      background: $pindou-primary-light;
    }
  }
}

.field--row {
  flex-direction: row;
  align-items: center;
  gap: 8px;

  input {
    width: auto;
  }
}

.swatch-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid $pindou-border-light;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color $pindou-duration-fast, box-shadow $pindou-duration-fast,
    transform $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.35);
    transform: translateX(2px);
  }

  &.active {
    border-color: $pindou-primary;
    box-shadow: 0 0 0 1px $pindou-primary;
  }
}

.swatch__color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.swatch__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.swatch__id {
  font-size: 11px;
  font-weight: 700;
}

.swatch__hex {
  font-size: 10px;
  color: $pindou-text-muted;
  font-family: ui-monospace, Consolas, monospace;
}

.tool-row {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid $pindou-border-light;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  color: $pindou-text;
  transition: color $pindou-duration-fast, border-color $pindou-duration-fast,
    background $pindou-duration-fast;

  &.active {
    background: $pindou-primary;
    border-color: $pindou-primary;
    color: #fff;
    font-weight: 600;
  }

  &--ghost {
    color: $pindou-text-muted;
  }
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.color-chip {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  box-shadow: inset 0 0 0 1px rgba(#fff, 0.55);
  transition: transform $pindou-duration-fast, box-shadow $pindou-duration-fast;

  &:hover {
    transform: translateY(-2px);
  }

  &.active {
    border-color: #111;
    box-shadow: 0 0 0 1px #fff inset;
  }
}

.preview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.preview__frames {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
  width: 100%;
}

.preview__palette-tip {
  display: flex;
  align-items: center;
  gap: 12px;

  p {
    margin: 0;
    font-size: 13px;
    color: $pindou-text-secondary;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  code {
    color: $pindou-primary;
    font-weight: 700;
  }

  p span {
    color: $pindou-text-muted;
    font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
    font-size: 10px;
    text-transform: uppercase;
  }
}

.preview__swatch-lg {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview__footer {
  margin: 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-secondary;
  line-height: 1.45;
}

.preview__error {
  margin: 0;
  font-size: $pindou-font-xs;
  color: #b91c1c;
}

.playground__code {
  border-top: 1px solid $pindou-border-light;
}

.playground__codebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: rgba($pindou-bg-muted, 0.4);

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 7px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: $pindou-text-secondary;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      color: $pindou-primary;
      background: rgba($pindou-primary, 0.08);
    }
  }
}

.playground__copy {
  color: $pindou-primary !important;
}

.playground__snippet {
  margin: 0;
  padding: 14px;
  background: #1e2230;
  color: #e8eaef;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

@media (max-width: 520px) {
  .playground__head {
    align-items: flex-start;
  }

  .playground__head-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
  }

  .playground__run-state {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .swatch,
  .tool-btn,
  .color-chip {
    transition: none;
  }
}
</style>
