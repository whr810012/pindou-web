<script setup lang="ts">
import type { PaletteEntry } from '@wangdandan810012/bead-core'
import { computed, ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { usePaletteStore } from '@/stores/palette'

const props = defineProps<{
  show: boolean
  selectedIds: string[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [entries: PaletteEntry[]]
}>()

const paletteStore = usePaletteStore()
const keyword = ref('')
const picked = ref<Set<string>>(new Set())

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    picked.value = new Set(props.selectedIds)
  },
)

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return paletteStore.fullEntries
  return paletteStore.fullEntries.filter((e) => {
    const code = e.codes[paletteStore.brand].toLowerCase()
    return code.includes(q) || e.hex.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
  })
})

function toggle(id: string) {
  const next = new Set(picked.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  picked.value = next
}

function selectAllVisible() {
  const next = new Set(picked.value)
  filtered.value.forEach((e) => next.add(e.id))
  picked.value = next
}

function clearPicked() {
  picked.value = new Set()
}

function confirmPick() {
  const map = new Map(paletteStore.fullEntries.map((e) => [e.id, e]))
  const entries = Array.from(picked.value)
    .map((id) => map.get(id))
    .filter(Boolean) as PaletteEntry[]
  emit('confirm', entries)
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="picker">
      <span class="title">从全色系勾选</span>
      <input v-model="keyword" class="search" placeholder="搜索色号 / HEX" />
      <div class="toolbar">
        <span class="hint">已选 {{ picked.size }} 色</span>
        <div class="actions">
          <PButton size="mini" plain text="全选当前" @click="selectAllVisible" />
          <PButton size="mini" plain text="清空" @click="clearPicked" />
        </div>
      </div>
      <div scroll-y class="list">
        <div
          v-for="entry in filtered"
          :key="entry.id"
          class="row"
          :class="{ active: picked.has(entry.id) }"
          @click="toggle(entry.id)"
        >
          <div class="swatch" :style="{ backgroundColor: entry.hex }" />
          <div class="info">
            <span class="code">{{ entry.codes[paletteStore.brand] }}</span>
            <span class="hex">{{ entry.hex }}</span>
          </div>
          <span class="check">{{ picked.has(entry.id) ? '✓' : '' }}</span>
        </div>
      </div>
      <div class="footer">
        <PButton text="取消" @click="emit('close')" />
        <PButton type="primary" text="添加到色板" @click="confirmPick" />
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.picker {
  padding: 16px;
  max-height: 80vh;
}

.title {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}

.search {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  margin-bottom: 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hint {
  font-size: 12px;
  color: #666;
}

.actions {
  display: flex;
  gap: 6px;
}

.list {
  max-height: 50vh;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-bottom: 1px solid #f3f3f3;
}

.row.active {
  background: #f0f7ff;
}

.swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.info {
  flex: 1;
}

.code {
  display: block;
  font-weight: 600;
  font-size: 13px;
}

.hex {
  display: block;
  font-size: 11px;
  color: #888;
}

.check {
  width: 20px;
  color: #2979ff;
  font-weight: 700;
}

.footer {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
