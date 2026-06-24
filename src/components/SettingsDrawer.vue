<script setup lang="ts">
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import PCell from '@/components/ui/PCell.vue'
import PSwitch from '@/components/ui/PSwitch.vue'
import PNumberBox from '@/components/ui/PNumberBox.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast, showModal, showActionSheet, setClipboardData, getSystemInfoSync, scanCode, chooseMessageFile, getFileSystemManager, request } from '@/utils/platform-ui'
import type { BrandSystem } from '@pindou/bead-core'
import { computed, onMounted, ref } from 'vue'
import { usePaletteStore } from '@/stores/palette'
import {
  BRAND_OPTIONS,
  MODE_OPTIONS,
  PALETTE_PRESET_OPTIONS,
} from '@/types/app'
import type { ParamPreset, ProjectParams } from '@/types/app'
import { getMaxGridWidth } from '@/adapters'
import {
  createParamPresetId,
  loadParamPresets,
  saveParamPresets,
} from '@/utils/paramPresetsStorage'

const props = defineProps<{
  show: boolean
  params: ProjectParams
  brand: BrandSystem
}>()

const emit = defineEmits<{
  close: []
  update: [params: Partial<ProjectParams>]
  brandChange: [brand: BrandSystem]
  applyPreset: [preset: ParamPreset]
}>()

const router = useRouter()
const paletteStore = usePaletteStore()
const maxGrid = getMaxGridWidth()
const savedPresets = ref<ParamPreset[]>([])

const presetOptions = computed(() => {
  const custom = paletteStore.customPalettes.map((p) => ({
    label: `${p.name} (${p.entries.length})`,
    value: p.id,
  }))
  return [...PALETTE_PRESET_OPTIONS, ...custom]
})

onMounted(() => {
  savedPresets.value = loadParamPresets()
})

function goPaletteEditor() {
  emit('close')
  router.push('/palette')
}

function saveCurrentPreset() {
  showModal({
    title: '保存参数预设',
    editable: true,
    placeholderText: '预设名称',
    success: (res) => {
      if (!res.confirm) return
      const name = res.content?.trim() || `预设 ${savedPresets.value.length + 1}`
      const preset: ParamPreset = {
        id: createParamPresetId(),
        name,
        params: { ...props.params },
        brand: props.brand,
        updatedAt: Date.now(),
      }
      savedPresets.value = [preset, ...savedPresets.value]
      saveParamPresets(savedPresets.value)
      showToast({ title: '已保存预设', icon: 'success' })
    },
  })
}

function applyPreset(preset: ParamPreset) {
  emit('applyPreset', preset)
  showToast({ title: `已应用：${preset.name}`, icon: 'success' })
}

function deletePreset(id: string) {
  savedPresets.value = savedPresets.value.filter((p) => p.id !== id)
  saveParamPresets(savedPresets.value)
}

function onGridWidthInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', { gridWidth: value })
}

function onMergeThresholdInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', { mergeThreshold: value })
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="drawer">
      <span class="title">生成参数</span>

      <div class="tag-row">
        <span class="label">我的预设</span>
        <div class="preset-actions">
          <PButton size="mini" type="primary" text="保存当前" @click="saveCurrentPreset" />
        </div>
        <div v-if="savedPresets.length" scroll-x class="preset-list">
          <div
            v-for="preset in savedPresets"
            :key="preset.id"
            class="preset-chip"
            @click="applyPreset(preset)"
          >
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-meta">{{ preset.params.gridWidth }}格 · {{ preset.params.mode }}</span>
            <span class="preset-del" @click.stop="deletePreset(preset.id)">×</span>
          </div>
        </div>
        <span v-else class="empty-hint">暂无保存的预设，调好参数后点「保存当前」</span>
      </div>

      <PCell title="横向格数">
        <template #value>
          <div class="range-row">
            <input
              type="range"
              class="range"
              :value="params.gridWidth"
              :min="20"
              :max="maxGrid"
              @input="onGridWidthInput"
            />
            <span class="range-val">{{ params.gridWidth }}</span>
          </div>
        </template>
      </PCell>

      <div class="tag-row">
        <span class="label">解析模式</span>
        <div class="tags">
          <PTag
            v-for="item in MODE_OPTIONS"
            :key="item.value"
            :text="item.label"
            :plain="params.mode !== item.value"
            type="primary"
            @click="emit('update', { mode: item.value as ProjectParams['mode'] })"
          />
        </div>
      </div>

      <PCell title="合并阈值">
        <template #value>
          <div class="range-row">
            <input
              type="range"
              class="range"
              :value="params.mergeThreshold"
              :min="0"
              :max="40"
              @input="onMergeThresholdInput"
            />
            <span class="range-val">{{ params.mergeThreshold }}</span>
          </div>
        </template>
      </PCell>

      <div class="tag-row">
        <span class="label">色板规格</span>
        <div class="tags">
          <PTag
            v-for="item in presetOptions"
            :key="item.value"
            :text="item.label"
            :plain="params.palettePresetId !== item.value"
            @click="emit('update', { palettePresetId: item.value })"
          />
        </div>
        <PButton size="mini" plain text="自定义色板编辑器" @click="goPaletteEditor" />
      </div>

      <div class="tag-row">
        <span class="label">品牌色号</span>
        <div class="tags">
          <PTag
            v-for="item in BRAND_OPTIONS"
            :key="item.value"
            :text="item.label"
            :plain="brand !== item.value"
            @click="emit('brandChange', item.value)"
          />
        </div>
      </div>

      <PButton type="primary" text="完成" @click="emit('close')" />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.drawer {
  padding: 16px;
  max-height: 80vh;
  overflow-y: auto;
}

.title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tag-row {
  padding: 8px 0 12px;
}

.label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preset-actions {
  margin-bottom: 8px;
}

.preset-list {
  white-space: nowrap;
}

.preset-chip {
  display: inline-block;
  position: relative;
  padding: 8px 28px 8px 12px;
  margin-right: 8px;
  border-radius: 10px;
  background: #f0f7ff;
  border: 1px solid #d6e8ff;
}

.preset-name {
  display: block;
  font-weight: 600;
  font-size: 13px;
}

.preset-meta {
  display: block;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.preset-del {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #999;
  font-size: 16px;
}

.empty-hint {
  font-size: 12px;
  color: #aaa;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.range {
  flex: 1;
  accent-color: $pindou-primary;
}

.range-val {
  min-width: 28px;
  text-align: right;
  font-size: 13px;
  color: $pindou-text-secondary;
}
</style>
