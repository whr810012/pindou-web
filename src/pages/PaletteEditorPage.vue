<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PTag from '@/components/ui/PTag.vue'
import PCell from '@/components/ui/PCell.vue'
import PSwitch from '@/components/ui/PSwitch.vue'
import PNumberBox from '@/components/ui/PNumberBox.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast, showModal, showActionSheet, setClipboardData, getSystemInfoSync, scanCode, chooseMessageFile, getFileSystemManager, request } from '@/utils/platform-ui'
import type { PaletteEntry } from '@pindou/bead-core'
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
  paletteStore.renameCustomPalette(activeId.value, paletteName.value.trim() || '未命名色板')
  showToast({ title: '已保存名称', icon: 'success' })
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
    showToast({ title: '已添加', icon: 'success' })
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
    showToast({ title: `已导入 ${parsed.length} 色`, icon: 'success' })
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
  showToast({ title: '已复制到剪贴板', icon: 'success' })
}

function onPickerConfirm(selected: PaletteEntry[]) {
  if (!selected.length) {
    pickerVisible.value = false
    return
  }
  const cloned = selected.map((e) => ({ ...e, id: createCustomEntryId() }))
  paletteStore.importCustomEntries(activeId.value, cloned, 'append')
  pickerVisible.value = false
  showToast({ title: `已添加 ${cloned.length} 色`, icon: 'success' })
}

function onShareImport(payload: { name: string; entries: PaletteEntry[] }) {
  showModal({
    title: '导入分享色板',
    content: `「${payload.name}」共 ${payload.entries.length} 色，新建还是追加到当前色板？`,
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
  showToast({ title: `已提取 ${extracted.length} 色`, icon: 'success' })
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
  <div class="page">
    <div class="card">
      <span class="section-title">色板列表</span>
      <div scroll-x class="palette-tabs">
        <div
          v-for="palette in paletteStore.customPalettes"
          :key="palette.id"
          class="tab"
          :class="{ active: palette.id === activeId }"
          @click="switchPalette(palette.id)"
        >
          {{ palette.name }} ({{ palette.entries.length }})
        </div>
      </div>
      <div class="row">
        <PButton size="small" text="新建" @click="createPalette" />
        <PButton size="small" plain text="删除" @click="deletePalette" />
        <PButton size="small" plain text="分享" @click="shareVisible = true" />
        <PButton size="small" type="primary" text="应用到项目" @click="applyPalette" />
      </div>
    </div>

    <div class="card">
      <span class="section-title">色板名称</span>
      <input v-model="paletteName" class="input" placeholder="色板名称" />
      <PButton size="small" plain text="保存名称" @click="renamePalette" />
    </div>

    <div class="card">
      <span class="section-title">添加色号</span>
      <div class="add-row">
        <input v-model="newHex" class="input hex-input" placeholder="#RRGGBB" />
        <div class="swatch" :style="{ backgroundColor: newHex }" />
        <input v-model="newCode" class="input" placeholder="色号" />
        <PButton size="small" type="primary" text="添加" @click="addEntry" />
      </div>
      <div class="brand-row">
        <span class="hint">当前品牌：</span>
        <PTag
          v-for="item in BRAND_OPTIONS"
          :key="item.value"
          :text="item.label"
          :plain="paletteStore.brand !== item.value"
          size="mini"
          @click="paletteStore.setBrand(item.value)"
        />
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <span class="section-title">色号列表 ({{ entries.length }})</span>
        <div class="toolbar-actions">
          <PButton size="mini" plain text="全色系" @click="pickerVisible = true" />
          <PButton size="mini" plain text="从项目" @click="extractFromProject" />
          <PButton size="mini" plain text="导入" @click="importVisible = true" />
          <PButton size="mini" plain text="选文件" @click="pickImportFile" />
          <PButton size="mini" plain text="JSON" @click="copyExport('json')" />
          <PButton size="mini" plain text="CSV" @click="copyExport('csv')" />
        </div>
      </div>

      <div scroll-y class="entry-list">
        <div v-for="entry in entries" :key="entry.id" class="entry">
          <div class="swatch" :style="{ backgroundColor: entry.hex }" />
          <div class="entry-info">
            <span class="code">{{ entry.codes[paletteStore.brand] }}</span>
            <span class="hex">{{ entry.hex }}</span>
          </div>
          <PButton size="mini" type="error" plain text="删" @click="removeEntry(entry.id)" />
        </div>
        <div v-if="!entries.length" class="empty">暂无色号，请添加或导入</div>
      </div>
    </div>

    <PDrawer :modelValue="importVisible"  round="16" @update:modelValue="importVisible = false">
      <div class="import-panel">
        <span class="section-title">导入色号</span>
        <span class="hint">支持 JSON 数组或 CSV（code,hex），例如 R1,#FF0000</span>
        <textarea v-model="importText" class="import-area" placeholder="粘贴 JSON / CSV 内容" />
        <div class="row">
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

.section-title {
  display: block;
  font-weight: 600;
  margin-bottom: $pindou-space-sm;
}

.palette-tabs {
  white-space: nowrap;
  margin-bottom: $pindou-space-sm;
}

.tab {
  display: inline-block;
  padding: 6px 12px;
  margin-right: $pindou-space-sm;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-muted;
  font-size: $pindou-font-sm;
}

.tab.active {
  background: $pindou-primary;
  color: #fff;
}

.row {
  display: flex;
  gap: $pindou-space-sm;
  flex-wrap: wrap;
  margin-top: $pindou-space-sm;
}

.input {
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  padding: $pindou-space-sm 10px;
  font-size: $pindou-font-md;
  margin-bottom: $pindou-space-sm;
}

.add-row {
  display: flex;
  align-items: center;
  gap: $pindou-space-sm;
  flex-wrap: wrap;
}

.hex-input {
  width: 110px;
  margin-bottom: 0;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.brand-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: $pindou-space-sm;
}

.hint {
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $pindou-space-sm;
}

.toolbar-actions {
  display: flex;
  gap: $pindou-space-xs;
  flex-wrap: wrap;
}

.entry-list {
  max-height: 360px;
}

.entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: $pindou-space-sm 0;
  border-bottom: 1px solid $pindou-border-light;
}

.entry-info {
  flex: 1;
}

.code {
  display: block;
  font-weight: 600;
}

.hex {
  display: block;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.import-panel {
  padding: $pindou-space-lg;
}

.import-area {
  width: 100%;
  min-height: 160px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  padding: 10px;
  font-size: 13px;
  box-sizing: border-box;
  margin: $pindou-space-sm 0 $pindou-space-md;
}
</style>
