<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectParams } from '@/types/app'
import { MODE_OPTIONS, PALETTE_PRESET_OPTIONS } from '@/types/app'
import { getMaxGridWidth } from '@/adapters'

const props = defineProps<{
  params: ProjectParams
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [params: Partial<ProjectParams>]
  openSettings: []
}>()

const maxGrid = getMaxGridWidth()

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

function bumpGrid(delta: number) {
  const next = Math.max(20, Math.min(maxGrid, props.params.gridWidth + delta))
  if (next !== props.params.gridWidth) emit('update', { gridWidth: next })
}

function toggleMode() {
  emit('update', { mode: props.params.mode === 'average' ? 'dominant' : 'average' })
}
</script>

<template>
  <div class="param-strip" :class="{ 'param-strip--disabled': disabled }">
    <div class="param-strip__head">
      <span class="param-strip__title">快速调参</span>
      <button type="button" class="param-strip__more" :disabled="disabled" @click="emit('openSettings')">
        全部参数 ›
      </button>
    </div>
    <div class="param-strip__row">
      <div class="param-group">
        <span class="param-label">格数</span>
        <div class="stepper">
          <button type="button" class="step-btn" :disabled="disabled" @click="bumpGrid(-4)">−</button>
          <span class="step-val">{{ params.gridWidth }}</span>
          <button type="button" class="step-btn" :disabled="disabled" @click="bumpGrid(4)">+</button>
        </div>
      </div>
      <button type="button" class="param-chip param-chip--accent" :disabled="disabled" @click="toggleMode">
        {{ modeLabel }}
      </button>
      <button
        type="button"
        class="param-chip"
        :disabled="disabled"
        @click="emit('openSettings')"
      >
        {{ paletteLabel }} · 合并 {{ params.mergeThreshold }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.param-strip {
  background: $pindou-bg-card;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-md;
  padding: 14px $pindou-space-md;
  margin-bottom: $pindou-space-md;
  box-shadow: $pindou-shadow-sm;
}

.param-strip--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.param-strip__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.param-strip__title {
  font-size: $pindou-font-sm;
  font-weight: 600;
  color: $pindou-text-secondary;
}

.param-strip__more {
  border: none;
  background: transparent;
  color: $pindou-primary;
  font-size: $pindou-font-sm;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;

  &:disabled {
    cursor: not-allowed;
  }
}

.param-strip__row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.param-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-label {
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
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
  width: 34px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: $pindou-primary;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba($pindou-primary, 0.08);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.step-val {
  min-width: 40px;
  text-align: center;
  font-size: $pindou-font-md;
  font-weight: 700;
  color: $pindou-text;
}

.param-chip {
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-muted;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  padding: 7px 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    border-color: rgba($pindou-primary, 0.35);
    background: rgba($pindou-primary, 0.06);
  }

  &--accent {
    background: $pindou-primary-light;
    border-color: rgba($pindou-primary, 0.2);
    color: $pindou-primary;
    font-weight: 600;
  }
}
</style>
