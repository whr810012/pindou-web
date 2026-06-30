<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import { showToast, showModal } from '@/utils/platform-ui'
import type { PaletteEntry } from '@wangdandan810012/bead-core'
import { computed, onMounted, ref } from 'vue'
import PalettePickerModal from '@/components/PalettePickerModal.vue'
import PaletteShareSheet from '@/components/PaletteShareSheet.vue'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { BRAND_OPTIONS } from '@/types/app'
import {
  createCustomEntryId,
  exportPaletteCsv,
  exportPaletteJson,
  parsePaletteImport,
} from '@/utils/customPaletteStorage'
import { extractEntriesFromGrid } from '@/utils/paletteShare'
import { usePageSeo } from '@/utils/seo'

usePageSeo('paletteEditor')

const paletteStore = usePaletteStore()
const project = useProjectStore()

const activeId = ref('')
const newHex = ref('#FF6B6B')
const newCode = ref('')
const importText = ref('')
const importVisible = ref(false)
const pickerVisible = ref(false)
const shareVisible = ref(false)
const paletteName = ref('我的色板')

const activePalette = computed(() =>
  paletteStore.customPalettes.find((p) => p.id === activeId.value),
)

const entries = computed(() => activePalette.value?.entries ?? [])

const existingEntryIds = computed(() => {
  const hexSet = new Set(entries.value.map((e) => e.hex.toUpperCase()))
  return paletteStore.fullEntries.filter((e) => hexSet.has(e.hex.toUpperCase())).map((e) => e.id)
})

onMounted(async () => {
  await paletteStore.loadPalettes()
  if (paletteStore.customPalettes.length) {
    activeId.value = paletteStore.customPalettes[0].id
    paletteName.value = paletteStore.customPalettes[0].name
  } else {
    const id = paletteStore.createCustomPalette('我的色板')
    activeId.value = id
  }
})

function switchPalette(id: string) {
  activeId.value = id
  const palette = paletteStore.customPalettes.find((p) => p.id === id)
  if (palette) paletteName.value = palette.name
}

function createPalette() {
  showModal({
    title: '新建色板',
    editable: true,
    placeholderText: '色板名称',
    success: (res) => {
      if (!res.confirm) return
      const name = res.content?.trim() || `色板 ${paletteStore.customPalettes.length + 1}`
      const id = paletteStore.createCustomPalette(name)
      activeId.value = id
      paletteName.value = name
    },
  })
}

function renamePalette() {
  if (!activeId.value) return
  paletteStore.renameCustomPalette(activeId.value, paletteName.value.trim() || '未命名色�?)
  showToast({ title: '已保存名�?, icon: 'success' })
}

function deletePalette() {
  if (!activeId.value) return
  showModal({
    title: '删除色板',
    content: '确定删除当前自定义色板？',
    success: (res) => {
      if (!res.confirm) return
      paletteStore.deleteCustomPalette(activeId.value)
      activeId.value = paletteStore.customPalettes[0]?.id ?? ''
      paletteName.value = paletteStore.customPalettes[0]?.name ?? ''
    },
  })
}

function addEntry() {
  if (!activeId.value || !newHex.value || !newCode.value.trim()) {
    showToast({ title: '请填写色值与色号', icon: 'none' })
    return
  }
  try {
    paletteStore.addCustomEntry(activeId.value, newHex.value, newCode.value.trim())
    newCode.value = ''
    showToast({ title: '已添�?, icon: 'success' })
  } catch (error) {
    showToast({ title: '颜色格式无效', icon: 'none' })
  }
}

function removeEntry(entryId: string) {
  paletteStore.removeCustomEntry(activeId.value, entryId)
}

function doImport(mode: 'append' | 'replace') {
  try {
    const parsed = parsePaletteImport(importText.value, paletteStore.brand)
    if (!parsed.length) {
      showToast({ title: '未解析到色号', icon: 'none' })
      return
    }
    paletteStore.importCustomEntries(activeId.value, parsed, mode)
    importVisible.value = false
    importText.value = ''
    showToast({ title: `已导�?${parsed.length} 色`, icon: 'success' })
  } catch (error) {
    showToast({ title: (error as Error).message || '导入失败', icon: 'none' })
  }
}

function applyPalette() {
  if (!activeId.value || !entries.value.length) {
    showToast({ title: '色板为空', icon: 'none' })
    return
  }
  paletteStore.setPreset(activeId.value)
  project.setParams({ palettePresetId: activeId.value })
  showToast({ title: '已应用自定义色板', icon: 'success' })
}

function copyExport(format: 'json' | 'csv') {
  if (!entries.value.length) return
  const text =
    format === 'json'
      ? exportPaletteJson(entries.value)
      : exportPaletteCsv(entries.value, paletteStore.brand)

  
  navigator.clipboard.writeText(text)
  showToast({ title: '已复制到剪贴�?, icon: 'success' })
}

function onPickerConfirm(selected: PaletteEntry[]) {
  if (!selected.length) {
    pickerVisible.value = false
    return
  }
  const cloned = selected.map((e) => ({ ...e, id: createCustomEntryId() }))
  paletteStore.importCustomEntries(activeId.value, cloned, 'append')
  pickerVisible.value = false
  showToast({ title: `已添�?${cloned.length} 色`, icon: 'success' })
}

function onShareImport(payload: { name: string; entries: PaletteEntry[] }) {
  showModal({
    title: '导入分享色板',
    content: `�?{payload.name}」共 ${payload.entries.length} 色，新建还是追加到当前色板？`,
    confirmText: '新建',
    cancelText: '追加',
    success: (res) => {
      if (res.confirm) {
        const id = paletteStore.importSharedPalette(payload.name, payload.entries, 'new')
        activeId.value = id
        paletteName.value = payload.name
      } else if (res.cancel) {
        paletteStore.importSharedPalette(payload.name, payload.entries, 'append', activeId.value)
      }
      shareVisible.value = false
      showToast({ title: '导入成功', icon: 'success' })
    },
  })
}

function extractFromProject() {
  if (!project.grid?.length) {
    showToast({ title: '请先在工作台生成图纸', icon: 'none' })
    return
  }
  const extracted = extractEntriesFromGrid(project.grid, (id) => paletteStore.findEntry(id))
  if (!extracted.length) {
    showToast({ title: '图纸中无有效色号', icon: 'none' })
    return
  }
  paletteStore.importCustomEntries(activeId.value, extracted, 'append')
  showToast({ title: `已提�?${extracted.length} 色`, icon: 'success' })
}

function pickImportFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.csv,.txt'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    importText.value = await file.text()
    importVisible.value = true
  }
  input.click()
}
</script>

<template>
  <div class="page page-enter">
    <header class="craft-page-head">
      <h1 class="craft-page-head__title">自定义色�?/h1>
      <p class="craft-page-head__sub">管理色号集合，导入导出或从当前图纸提取颜色�?/p>
    </header>

    <div class="card palette-panel">
      <span class="craft-label">色板列表</span>
      <div scroll-x class="palette-tabs craft-scroll-tabs">
        <button
          v-for="palette in paletteStore.customPalettes"
          :key="palette.id"
          type="button"
          class="palette-tab"
          :class="{ active: palette.id === activeId }"
          @click="switchPalette(palette.id)"
        >
          {{ palette.name }}
          <span class="palette-tab__count">{{ palette.entries.length }}</span>
        </button>
      </div>
      <div class="palette-toolbar">
        <PButton size="small" plain text="新建" @click="createPalette" />
        <PButton size="small" plain text="删除" @click="deletePalette" />
        <PButton size="small" plain text="分享" @click="shareVisible = true" />
        <PButton size="small" type="primary" text="应用到项�? @click="applyPalette" />
      </div>
    </div>

    <div class="card palette-panel">
      <span class="craft-label">色板名称</span>
      <div class="name-row">
        <input v-model="paletteName" class="craft-input" placeholder="色板名称" />
        <PButton size="small" plain text="保存" @click="renamePalette" />
      </div>
    </div>

    <div class="card palette-panel">
      <span class="craft-label">添加色号</span>
      <div class="add-row">
        <input v-model="newHex" class="craft-input add-hex" placeholder="#RRGGBB" />
        <span class="add-swatch" :style="{ backgroundColor: newHex }" aria-hidden="true" />
        <input v-model="newCode" class="craft-input add-code" placeholder="色号" />
        <PButton size="small" type="primary" text="添加" @click="addEntry" />
      </div>
      <div class="craft-section craft-section--flush">
        <span class="craft-label">品牌色号</span>
        <div class="craft-tags">
          <PTag
            v-for="item in BRAND_OPTIONS"
            :key="item.value"
            :text="item.label"
            :plain="paletteStore.brand !== item.value"
            @click="paletteStore.setBrand(item.value)"
          />
        </div>
      </div>
    </div>

    <div class="card palette-panel">
      <div class="list-head">
        <span class="craft-label list-head__label">色号列表 · {{ entries.length }} �?/span>
        <div class="list-head__actions">
          <button type="button" class="tool-chip" @click="pickerVisible = true">全色�?/button>
          <button type="button" class="tool-chip" @click="extractFromProject">从项�?/button>
          <button type="button" class="tool-chip" @click="importVisible = true">导入</button>
          <button type="button" class="tool-chip" @click="pickImportFile">选文�?/button>
          <button type="button" class="tool-chip" @click="copyExport('json')">JSON</button>
          <button type="button" class="tool-chip" @click="copyExport('csv')">CSV</button>
        </div>
      </div>

      <div v-if="entries.length" scroll-y class="entry-grid">
        <div v-for="entry in entries" :key="entry.id" class="entry-card">
          <div class="entry-card__swatch" :style="{ backgroundColor: entry.hex }" />
          <div class="entry-card__info">
            <span class="entry-card__code">{{ entry.codes[paletteStore.brand] }}</span>
            <span class="entry-card__hex">{{ entry.hex }}</span>
          </div>
          <button
            type="button"
            class="entry-card__del"
            aria-label="删除色号"
            @click="removeEntry(entry.id)"
          >
            ×
          </button>
        </div>
      </div>
      <div v-else class="palette-empty">
        <span class="palette-empty__icon" aria-hidden="true" />
        <p>暂无色号，请添加、导入或从项目提�?/p>
      </div>
    </div>

    <PDrawer :model-value="importVisible" @update:model-value="importVisible = false">
      <div class="craft-drawer">
        <span class="craft-drawer__title">导入色号</span>
        <p class="craft-hint">支持 JSON 数组�?CSV（code,hex），例如 R1,#FF0000</p>
        <textarea v-model="importText" class="craft-textarea" rows="6" placeholder="粘贴 JSON / CSV 内容" />
        <div class="import-actions">
          <PButton text="追加导入" @click="doImport('append')" />
          <PButton type="primary" text="覆盖导入" @click="doImport('replace')" />
        </div>
      </div>
    </PDrawer>

    <PalettePickerModal
      :show="pickerVisible"
      :selected-ids="existingEntryIds"
      @close="pickerVisible = false"
      @confirm="onPickerConfirm"
    />

    <PaletteShareSheet
      :show="shareVisible"
      :name="paletteName"
      :entries="entries"
      @close="shareVisible = false"
      @import="onShareImport"
    />
  </div>
</template>

<style scoped lang="scss">
.page {
  padding-bottom: $pindou-space-xl;
}

.palette-panel {
  margin-bottom: $pindou-space-md;
}

.palette-tabs {
  display: flex;
  gap: 8px;
  margin: 10px 0 14px;
  padding-bottom: 4px;
  overflow-x: auto;
}

.palette-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  font-size: $pindou-font-sm;
  font-weight: 600;
  color: $pindou-text-secondary;
  cursor: pointer;
  transition:
    background $pindou-duration-fast,
    border-color $pindou-duration-fast,
    color $pindou-duration-fast;

  &.active {
    background: $pindou-primary;
    border-color: $pindou-primary;
    color: #fff;

    .palette-tab__count {
      background: rgba(255, 255, 255, 0.22);
      color: #fff;
    }
  }
}

.palette-tab__count {
  min-width: 20px;
  padding: 1px 6px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.1);
  color: $pindou-primary;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.palette-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;

  .craft-input {
    flex: 1;
    min-width: 0;
  }
}

.add-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.add-hex {
  width: 120px;
  flex: 0 0 auto;
}

.add-code {
  width: 100px;
  flex: 1;
  min-width: 80px;
}

.add-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px $pindou-border-light, $pindou-shadow-sm;
  flex-shrink: 0;
}

.list-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;

  @media (min-width: 560px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.list-head__label {
  margin-bottom: 0;
}

.list-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tool-chip {
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  padding: 5px 10px;
  font-size: $pindou-font-xs;
  font-weight: 600;
  color: $pindou-text-secondary;
  cursor: pointer;
  transition:
    border-color $pindou-duration-fast,
    color $pindou-duration-fast,
    background $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.35);
    color: $pindou-primary;
    background: #fff;
  }
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 2px;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-subtle;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.3);
    box-shadow: $pindou-shadow-sm;
  }
}

.entry-card__swatch {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.entry-card__info {
  flex: 1;
  min-width: 0;
}

.entry-card__code {
  display: block;
  font-weight: 700;
  font-size: $pindou-font-sm;
  color: $pindou-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-card__hex {
  display: block;
  font-size: 10px;
  color: $pindou-text-muted;
  font-variant-numeric: tabular-nums;
}

.entry-card__del {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: $pindou-text-hint;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  transition: background $pindou-duration-fast, color $pindou-duration-fast;

  &:hover {
    background: rgba($pindou-warning, 0.12);
    color: $pindou-warning;
  }
}

.palette-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px;
  text-align: center;
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
}

.palette-empty__icon {
  width: 48px;
  height: 48px;
  border-radius: $pindou-radius-sm;
  background: linear-gradient(135deg, $pindou-primary-light, $pindou-accent-soft);
  border: 2px dashed rgba($pindou-primary, 0.25);
}

.import-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.craft-textarea {
  margin-bottom: 12px;
}
</style>
