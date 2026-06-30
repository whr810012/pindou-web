<script setup lang="ts">
import { computed } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import type { ColorStat } from '@wangdandan810012/bead-core'

const props = defineProps<{
  stats: ColorStat[]
  excludedIds: string[]
}>()

const emit = defineEmits<{
  toggle: [paletteId: string]
  restoreAll: []
}>()

const totalBeads = computed(() => props.stats.reduce((sum, s) => sum + s.count, 0))
const excludedCount = computed(() => props.excludedIds.length)
</script>

<template>
  <div class="color-panel">
    <div class="color-panel__head">
      <div>
        <span class="color-panel__title">采购清单</span>
        <span class="color-panel__summary">{{ stats.length }} �?· �?{{ totalBeads }} �?/span>
      </div>
      <PButton
        v-if="excludedCount"
        size="mini"
        plain
        :text="`恢复 ${excludedCount} 色`"
        @click="emit('restoreAll')"
      />
    </div>
    <p class="color-panel__hint">点击色号可排除该颜色（自动重映射最近色�?/p>
    <div class="color-panel__list">
      <button
        v-for="stat in stats"
        :key="stat.paletteId"
        type="button"
        class="color-item"
        :class="{ 'color-item--excluded': excludedIds.includes(stat.paletteId) }"
        @click="emit('toggle', stat.paletteId)"
      >
        <span class="color-item__swatch" :style="{ backgroundColor: stat.hex }" />
        <span class="color-item__code">{{ stat.displayCode }}</span>
        <span class="color-item__count">{{ stat.count }} �?/span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.color-panel {
  background: $pindou-bg-card;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-md;
  padding: $pindou-space-md;
  margin-bottom: $pindou-space-md;
  box-shadow: $pindou-shadow-sm;
}

.color-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.color-panel__title {
  display: block;
  font-family: $pindou-font-display;
  font-weight: 800;
  font-size: $pindou-font-md;
}

.color-panel__summary {
  display: block;
  margin-top: 4px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.color-panel__hint {
  margin: 0 0 12px;
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
  line-height: 1.4;
}

.color-panel__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 2px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-subtle;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;

  &:hover {
    border-color: rgba($pindou-primary, 0.3);
    background: #fff;
  }

  &:active {
    transform: scale(0.98);
  }

  &--excluded {
    opacity: 0.5;
    text-decoration: line-through;
  }
}

.color-item__swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.color-item__code {
  flex: 1;
  font-size: $pindou-font-sm;
  font-weight: 600;
  color: $pindou-text;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-item__count {
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  flex-shrink: 0;
}
</style>
