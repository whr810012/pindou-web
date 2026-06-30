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
import type { BrandSystem } from '@wangdandan810012/bead-core'
import { computed, onMounted, ref } from 'vue'
import { usePaletteStore } from '@/stores/palette'
import {
  BRAND_OPTIONS,
  MODE_OPTIONS,
  PALETTE_PRESET_OPTIONS,
} from '@/types/app'
import type { ParamPreset, ProjectParams } from '@/types/app'
import { DEFAULT_IMAGE_ADJUST, DEFAULT_PHOTO_OPTIMIZE } from '@/types/app'
import { getMaxGridWidth } from '@/adapters'
import {
  createParamPresetId,
  loadParamPresets,
  saveParamPresets,
} from '@/utils/paramPresetsStorage'
import { decodeParamPresetShare, encodeParamPresetShare } from '@/utils/paramPresetShare'

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
const shareCode = ref('')
const importCode = ref('')

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
      showToast({ title: '已保存预�?, icon: 'success' })
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

function exportCurrentPresetShare() {
  shareCode.value = encodeParamPresetShare({
    name: `当前参数 ${props.params.gridWidth}格`,
    params: { ...props.params },
    brand: props.brand,
  })
  setClipboardData({
    data: shareCode.value,
    success: () => showToast({ title: '已复制参数分享码', icon: 'success' }),
  })
}

function exportPresetShare(preset: ParamPreset) {
  shareCode.value = encodeParamPresetShare(preset)
  setClipboardData({
    data: shareCode.value,
    success: () => showToast({ title: '已复制分享码', icon: 'success' }),
  })
}

function importPresetFromCode() {
  try {
    const preset = decodeParamPresetShare(importCode.value)
    savedPresets.value = [preset, ...savedPresets.value.filter((p) => p.id !== preset.id)]
    saveParamPresets(savedPresets.value)
    importCode.value = ''
    showToast({ title: `已导入：${preset.name}`, icon: 'success' })
  } catch (error) {
    showToast({ title: (error as Error).message || '解析失败', icon: 'none' })
  }
}

function onGridWidthInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', { gridWidth: value })
}

function onMergeThresholdInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', { mergeThreshold: value })
}

function onMaxColorsInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', { maxColors: value })
}

function onAdjustInput(key: 'brightness' | 'contrast' | 'saturation', e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update', {
    imageAdjust: { ...props.params.imageAdjust, [key]: value },
  })
}

function resetImageAdjust() {
  emit('update', { imageAdjust: { ...DEFAULT_IMAGE_ADJUST } })
}

function onPhotoOptimizeChange(key: 'denoise' | 'sharpen', value: boolean) {
  emit('update', {
    photoOptimize: { ...props.params.photoOptimize, [key]: value },
  })
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="craft-drawer">
      <span class="craft-drawer__title">生成参数</span>

      <div class="craft-section craft-section--flush">
        <span class="craft-label">我的预设</span>
        <div class="preset-actions">
          <PButton size="mini" type="primary" text="保存当前" @click="saveCurrentPreset" />
          <PButton size="mini" plain text="分享当前" @click="exportCurrentPresetShare" />
        </div>
        <div v-if="savedPresets.length" scroll-x class="preset-list">
          <div
            v-for="preset in savedPresets"
            :key="preset.id"
            class="craft-preset-chip"
            @click="applyPreset(preset)"
          >
            <span class="craft-preset-chip__name">{{ preset.name }}</span>
            <span class="craft-preset-chip__meta">{{ preset.params.gridWidth }}�?· {{ preset.params.mode }}</span>
            <span class="craft-preset-chip__share" title="复制分享�? @click.stop="exportPresetShare(preset)">�?/span>
            <span class="craft-preset-chip__del" @click.stop="deletePreset(preset.id)">×</span>
          </div>
        </div>
        <span v-else class="craft-hint">暂无保存的预设，调好参数后点「保存当前�?/span>

        <div class="import-block">
          <span class="craft-label">导入参数预设</span>
          <textarea
            v-model="importCode"
            class="craft-textarea import-code"
            rows="2"
            placeholder="粘贴 pindou-params-v1:..."
          />
          <PButton size="mini" plain text="解析导入" @click="importPresetFromCode" />
        </div>
      </div>

      <PCell title="横向格数">
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.gridWidth"
              :min="20"
              :max="maxGrid"
              @input="onGridWidthInput"
            />
            <span class="craft-range-val">{{ params.gridWidth }}</span>
          </div>
        </template>
      </PCell>

      <div class="craft-section">
        <span class="craft-label">解析模式</span>
        <div class="craft-tags">
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

      <PCell title="合并阈�?>
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.mergeThreshold"
              :min="0"
              :max="40"
              @input="onMergeThresholdInput"
            />
            <span class="craft-range-val">{{ params.mergeThreshold }}</span>
          </div>
        </template>
      </PCell>
      <p class="craft-hint">格数越大越清晰（照片可拉�?200+）；合并阈值照片保�?0</p>

      <PCell title="最大颜色数">
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.maxColors"
              :min="0"
              :max="48"
              @input="onMaxColorsInput"
            />
            <span class="craft-range-val">{{ params.maxColors === 0 ? '不限' : params.maxColors }}</span>
          </div>
        </template>
      </PCell>
      <p class="craft-hint">0 为不限制；限色过少会显得颜色不全，头像建�?12�?4</p>

      <div class="craft-section">
        <span class="craft-label">图片调节</span>
      <PCell title="亮度">
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.imageAdjust.brightness"
              :min="-100"
              :max="100"
              @input="onAdjustInput('brightness', $event)"
            />
            <span class="craft-range-val">{{ params.imageAdjust.brightness }}</span>
          </div>
        </template>
      </PCell>
      <PCell title="对比�?>
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.imageAdjust.contrast"
              :min="-100"
              :max="100"
              @input="onAdjustInput('contrast', $event)"
            />
            <span class="craft-range-val">{{ params.imageAdjust.contrast }}</span>
          </div>
        </template>
      </PCell>
      <PCell title="饱和�?>
        <template #value>
          <div class="craft-range-row">
            <input
              type="range"
              class="craft-range"
              :value="params.imageAdjust.saturation"
              :min="-100"
              :max="100"
              @input="onAdjustInput('saturation', $event)"
            />
            <span class="craft-range-val">{{ params.imageAdjust.saturation }}</span>
          </div>
        </template>
      </PCell>
      <div class="preset-actions">
        <PButton size="mini" plain text="重置图片调节" @click="resetImageAdjust" />
      </div>

      </div>

      <div class="craft-section">
        <span class="craft-label">照片优化</span>
      <PCell title="降噪（中值滤波）">
        <template #value>
          <PSwitch
            :model-value="params.photoOptimize.denoise"
            @update:model-value="onPhotoOptimizeChange('denoise', $event)"
          />
        </template>
      </PCell>
      <PCell title="锐化">
        <template #value>
          <PSwitch
            :model-value="params.photoOptimize.sharpen"
            @update:model-value="onPhotoOptimizeChange('sharpen', $event)"
          />
        </template>
      </PCell>
      <p class="craft-hint">适合照片类素材；卡通图建议关闭</p>
      </div>

      <div class="craft-section">
        <span class="craft-label">色板规格</span>
        <div class="craft-tags">
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

      <div class="craft-section">
        <span class="craft-label">品牌色号</span>
        <div class="craft-tags">
          <PTag
            v-for="item in BRAND_OPTIONS"
            :key="item.value"
            :text="item.label"
            :plain="brand !== item.value"
            @click="emit('brandChange', item.value)"
          />
        </div>
      </div>

      <PButton type="primary" block text="完成" @click="emit('close')" />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.preset-actions {
  margin-bottom: 10px;
}

.preset-list {
  white-space: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
}

.import-block {
  margin-top: 14px;

  .craft-label {
    display: block;
    margin-bottom: 6px;
  }
}

.import-code {
  margin-bottom: 8px;
  font-size: 12px;
}

.craft-preset-chip__share {
  margin-left: 4px;
  padding: 0 4px;
  font-size: 14px;
  color: $pindou-primary;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}
</style>
