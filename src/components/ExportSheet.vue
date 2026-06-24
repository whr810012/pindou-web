<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import PCell from '@/components/ui/PCell.vue'
import PSwitch from '@/components/ui/PSwitch.vue'
import PNumberBox from '@/components/ui/PNumberBox.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import type { ExportFormat, ExportSettings } from '@/types/app'
import { DEFAULT_EXPORT_SETTINGS } from '@/types/app'
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [settings: ExportSettings]
}>()

const settings = ref<ExportSettings>({ ...DEFAULT_EXPORT_SETTINGS })

const formats: Array<{ label: string; value: ExportFormat }> = [
  { label: 'PNG + 清单', value: 'all' },
  { label: '仅 PNG', value: 'png' },
  { label: 'PDF 图纸', value: 'pdf' },
]

watch(
  () => props.show,
  (visible) => {
    if (visible) settings.value = { ...DEFAULT_EXPORT_SETTINGS }
  },
)

function confirm() {
  emit('confirm', { ...settings.value })
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="sheet">
      <span class="title">导出设置</span>

      <div class="tag-row">
        <span class="label">导出格式</span>
        <div class="tags">
          <PTag
            v-for="item in formats"
            :key="item.value"
            :text="item.label"
            :plain="settings.format !== item.value"
            type="primary"
            @click="settings.format = item.value"
          />
        </div>
      </div>

      <PCell title="显示网格线">
        <template #value>
          <PSwitch v-model="settings.showGrid" />
        </template>
      </PCell>
      <PCell title="显示色号">
        <template #value>
          <PSwitch v-model="settings.showColorCode" />
        </template>
      </PCell>
      <PCell title="坐标标尺">
        <template #value>
          <PSwitch v-model="settings.showRuler" />
        </template>
      </PCell>
      <PCell title="格内坐标">
        <template #value>
          <PSwitch v-model="settings.showCoordinates" />
        </template>
      </PCell>
      <PCell title="单元格大小">
        <template #value>
          <PNumberBox v-model="settings.cellSize" :min="8" :max="32" />
        </template>
      </PCell>
      <PButton type="primary" text="导出" @click="confirm" />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.sheet {
  padding: 16px;
}

.title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tag-row {
  margin-bottom: 8px;
}

.label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
