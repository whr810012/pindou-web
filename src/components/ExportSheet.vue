<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import PCell from '@/components/ui/PCell.vue'
import PSwitch from '@/components/ui/PSwitch.vue'
import PNumberBox from '@/components/ui/PNumberBox.vue'
import type { ExportFormat, ExportSettings, PdfLayout } from '@/types/app'
import { DEFAULT_EXPORT_SETTINGS } from '@/types/app'
import { computed, ref, watch } from 'vue'

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

const pdfLayouts: Array<{ label: string; value: PdfLayout }> = [
  { label: '整图单页', value: 'single' },
  { label: '29×29 分板', value: 'boards' },
]

const showPdfLayout = computed(() => settings.value.format === 'pdf')

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
    <div class="craft-drawer">
      <span class="craft-drawer__title">导出设置</span>

      <div class="craft-section craft-section--flush">
        <span class="craft-label">导出格式</span>
        <div class="craft-tags">
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

      <div v-if="showPdfLayout" class="craft-section">
        <span class="craft-label">PDF 布局</span>
        <div class="craft-tags">
          <PTag
            v-for="item in pdfLayouts"
            :key="item.value"
            :text="item.label"
            :plain="settings.pdfLayout !== item.value"
            type="primary"
            @click="settings.pdfLayout = item.value"
          />
        </div>
      </div>

      <div class="craft-section">
      <PCell title="显示网格线">
        <template #value>
          <PSwitch v-model="settings.showGrid" />
        </template>
      </PCell>
      <PCell title="拼板分割线（每 29 格）">
        <template #value>
          <PSwitch v-model="settings.showBoardLines" />
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
      </div>
      <PButton type="primary" block text="导出" @click="confirm" />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
// 样式由 craft-drawer / PCell 等共享类提供
</style>
