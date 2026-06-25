<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectParams } from '@/types/app'
import { DEFAULT_IMAGE_ADJUST, MODE_OPTIONS, PALETTE_PRESET_OPTIONS } from '@/types/app'
import { getMaxGridWidth } from '@/adapters'

const props = defineProps<{
  params: ProjectParams
  disabled?: boolean
  busy?: boolean
  missingSource?: boolean
}>()

const emit = defineEmits<{
  update: [params: Partial<ProjectParams>]
  openSettings: []
}>()

const maxGrid = getMaxGridWidth()
const minGrid = 20

const atMin = computed(() => props.params.gridWidth <= minGrid)
const atMax = computed(() => props.params.gridWidth >= maxGrid)
const controlsLocked = computed(() => props.disabled || props.busy || props.missingSource)

const modeLabel = computed(() => {
  const item = MODE_OPTIONS.find((m) => m.value === props.params.mode)
  return item?.label.replace(/（.+）/, '') ?? props.params.mode
})

const paletteLabel = computed(() => {
  const item = PALETTE_PRESET_OPTIONS.find((p) => p.value === props.params.palettePresetId)
  if (item) return item.label
  if (props.params.palettePresetId.startsWith('custom-')) return '自定义'
  return '色板'
})

const hasCustomAdjust = computed(() => {
  const adj = props.params.imageAdjust
  return (
    adj.brightness !== DEFAULT_IMAGE_ADJUST.brightness ||
    adj.contrast !== DEFAULT_IMAGE_ADJUST.contrast ||
    adj.saturation !== DEFAULT_IMAGE_ADJUST.saturation
  )
})

const hasMaxColors = computed(() => props.params.maxColors > 0)

const adjustSummary = computed(() => {
  const parts: string[] = []
  if (hasMaxColors.value) {
    parts.push(`限色 ${props.params.maxColors}`)
  }
  if (hasCustomAdjust.value) {
    const adj = props.params.imageAdjust
    const fmt = (v: number) => (v > 0 ? `+${v}` : String(v))
    parts.push(`亮度${fmt(adj.brightness)} · 对比${fmt(adj.contrast)} · 饱和${fmt(adj.saturation)}`)
  }
  return parts.join(' · ')
})

function bumpGrid(delta: number) {
  const next = Math.max(minGrid, Math.min(maxGrid, props.params.gridWidth + delta))
  if (next !== props.params.gridWidth) emit('update', { gridWidth: next })
}

function toggleMode() {
  emit('update', { mode: props.params.mode === 'average' ? 'dominant' : 'average' })
}
</script>

<template>
  <div class="param-strip" :class="{ 'param-strip--busy': busy }">
    <div class="param-strip__head">
      <div class="param-strip__title-wrap">
        <span class="param-strip__title">快速调参</span>
        <span v-if="busy" class="param-strip__status">生成中…</span>
      </div>
      <button
        type="button"
        class="param-strip__more"
        :disabled="controlsLocked"
        @click="emit('openSettings')"
      >
        全部参数 ›
      </button>
    </div>

    <div class="param-strip__body">
      <div class="param-grid-card">
        <span class="param-grid-card__label">格数</span>
        <div class="stepper">
          <button
            type="button"
            class="step-btn"
            :disabled="controlsLocked || atMin"
            aria-label="减少格数"
            @click="bumpGrid(-4)"
          >
            −
          </button>
          <span class="step-val">{{ params.gridWidth }}</span>
          <button
            type="button"
            class="step-btn"
            :disabled="controlsLocked || atMax"
            aria-label="增加格数"
            @click="bumpGrid(4)"
          >
            +
          </button>
        </div>
        <span class="param-grid-card__range">{{ minGrid }}–{{ maxGrid }}</span>
      </div>

      <div class="param-strip__chips">
        <button
          type="button"
          class="param-chip param-chip--accent"
          :disabled="controlsLocked"
          @click="toggleMode"
        >
          {{ modeLabel }}
        </button>
        <button
          type="button"
          class="param-chip"
          :disabled="controlsLocked"
          @click="emit('openSettings')"
        >
          {{ paletteLabel }} · 合并 {{ params.mergeThreshold }}
        </button>
      </div>
    </div>

    <p v-if="atMax" class="param-strip__hint">已达上限 {{ maxGrid }} 格</p>
    <p v-else-if="missingSource" class="param-strip__hint param-strip__hint--warn">
      缺少原图，请换图后重新上传
    </p>
    <p v-else-if="busy" class="param-strip__hint">参数已更新，正在重新生成图纸…</p>
    <p v-if="adjustSummary" class="param-strip__summary">{{ adjustSummary }}</p>
  </div>
</template>

<style scoped lang="scss">
.param-strip {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #fff 0%, rgba($pindou-primary, 0.02) 100%);
  border: 1px solid rgba($pindou-primary, 0.12);
  border-radius: $pindou-radius-md;
  padding: 14px $pindou-space-md;
  margin-bottom: $pindou-space-md;
  box-shadow: $pindou-shadow-sm;
}

.param-strip--busy {
  border-color: rgba($pindou-primary, 0.22);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $pindou-primary, transparent);
    animation: param-busy-line 1.2s ease-in-out infinite;
  }
}

@keyframes param-busy-line {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.param-strip__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.param-strip__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-strip__title {
  font-size: $pindou-font-sm;
  font-weight: 700;
  color: $pindou-text;
  letter-spacing: 0.02em;
}

.param-strip__status {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.1);
  color: $pindou-primary;
  font-size: $pindou-font-xs;
  font-weight: 600;
}

.param-strip__more {
  border: none;
  background: transparent;
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.param-strip__body {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-wrap: wrap;
}

.param-grid-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: $pindou-radius-sm;
  background: #fff;
  border: 1px solid $pindou-border-light;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.param-grid-card__label {
  font-size: $pindou-font-sm;
  font-weight: 600;
  color: $pindou-text-secondary;
}

.param-grid-card__range {
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
  padding-left: 2px;
  border-left: 1px solid $pindou-border-light;
}

.param-strip__chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.param-strip__summary {
  margin: 10px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.4;
}

.param-strip__hint {
  margin: 10px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  line-height: 1.4;

  &--warn {
    color: $pindou-warning;
  }
}

.stepper {
  display: inline-flex;
  align-items: center;
  background: $pindou-bg-muted;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  overflow: hidden;
}

.step-btn {
  width: 36px;
  height: 34px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: $pindou-primary;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: rgba($pindou-primary, 0.1);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.step-val {
  min-width: 44px;
  text-align: center;
  font-size: $pindou-font-lg;
  font-weight: 700;
  color: $pindou-text;
  font-variant-numeric: tabular-nums;
}

.param-chip {
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: #fff;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  padding: 8px 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &:hover:not(:disabled) {
    border-color: rgba($pindou-primary, 0.35);
    background: rgba($pindou-primary, 0.04);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--accent {
    background: $pindou-primary-light;
    border-color: rgba($pindou-primary, 0.22);
    color: $pindou-primary;
    font-weight: 600;
  }
}
</style>
