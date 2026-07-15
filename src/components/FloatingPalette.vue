<script setup lang="ts">
import type { PaletteEntry } from '@wangdandan810012/bead-core'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    entries: PaletteEntry[]
    selectedId: string
    selectedHex: string
    codeLookup: (id: string) => string
    replaceMode?: boolean
    replaceFromCode?: string
    replaceFromHex?: string
  }>(),
  {
    replaceMode: false,
    replaceFromCode: '',
    replaceFromHex: '',
  },
)

const emit = defineEmits<{
  select: [entry: PaletteEntry]
}>()

const keyword = ref('')
const showAll = ref(false)

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  let list = props.entries
  if (!showAll.value) list = list.slice(0, 36)
  if (!q) return list
  return props.entries.filter((e) => {
    const code = props.codeLookup(e.id).toLowerCase()
    return code.includes(q) || e.hex.toLowerCase().includes(q)
  })
})

const selectedCode = computed(() => props.codeLookup(props.selectedId))
</script>

<template>
  <div class="floating-palette" :class="{ 'floating-palette--replace': replaceMode }">
    <div v-if="replaceMode" class="replace-banner">
      <span
        v-if="replaceFromHex"
        class="replace-swatch"
        :style="{ backgroundColor: replaceFromHex }"
      />
      <span>选择新色即可替换「{{ replaceFromCode || '旧色' }}」</span>
    </div>
    <div class="current">
      <div class="current-swatch" :style="{ backgroundColor: selectedHex }" />
      <div class="current-meta">
        <span class="current-label">{{ replaceMode ? '将换成' : '当前画笔' }}</span>
        <span class="current-code">{{ selectedCode || '未选色' }}</span>
      </div>
      <input
        v-model="keyword"
        class="search"
        type="search"
        placeholder="搜索色号"
        @click.stop
      />
    </div>
    <div scroll-x class="row">
      <button
        v-for="entry in filtered"
        :key="entry.id"
        type="button"
        class="chip"
        :class="{ active: entry.id === selectedId }"
        :style="{ backgroundColor: entry.hex }"
        :title="codeLookup(entry.id)"
        @click="emit('select', entry)"
      >
        <span class="label">{{ codeLookup(entry.id) }}</span>
      </button>
      <button
        v-if="!keyword && entries.length > 36"
        type="button"
        class="chip chip--more"
        @click="showAll = !showAll"
      >
        {{ showAll ? '收起' : `+${entries.length - 36}` }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.floating-palette {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.floating-palette--replace {
  border: 1px solid rgba(232, 156, 36, 0.55);
  box-shadow: 0 4px 16px rgba(232, 156, 36, 0.18);
}

.replace-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  background: $pindou-warning-bg;
  color: $pindou-warning;
  font-size: $pindou-font-xs;
  font-weight: 600;
}

.replace-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.current {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.current-meta {
  flex-shrink: 0;
}

.current-label {
  display: block;
  font-size: 10px;
  color: $pindou-text-muted;
}

.current-code {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.search {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid $pindou-border-light;
  border-radius: 8px;
  font-size: $pindou-font-sm;
  background: $pindou-bg-muted;
}

.row {
  white-space: nowrap;
}

.chip {
  display: inline-flex;
  width: 36px;
  height: 36px;
  margin-right: 6px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  vertical-align: top;
}

.chip.active {
  border-color: #2979ff;
  box-shadow: 0 0 0 1px #2979ff;
}

.chip--more {
  background: $pindou-bg-muted;
  font-size: 11px;
  color: $pindou-text-secondary;
  width: auto;
  min-width: 44px;
  padding: 0 8px;
}

.label {
  font-size: 9px;
  color: #111;
  text-shadow: 0 0 2px #fff;
}
</style>
