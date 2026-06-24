<script setup lang="ts">
import type { PaletteEntry } from '@pindou/bead-core'
import { ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { decodePaletteShare, encodePaletteShare } from '@/utils/paletteShare'
import { setClipboardData, showToast } from '@/utils/platform-ui'

const props = defineProps<{
  show: boolean
  name: string
  entries: PaletteEntry[]
}>()

const emit = defineEmits<{
  close: []
  import: [payload: { name: string; entries: PaletteEntry[] }]
}>()

const shareCode = ref('')
const pasteCode = ref('')

watch(
  () => [props.show, props.entries, props.name],
  () => {
    if (!props.show || !props.entries.length) return
    shareCode.value = encodePaletteShare(props.name, props.entries)
  },
  { deep: true },
)

function copyShareCode() {
  setClipboardData({
    data: shareCode.value,
    success: () => showToast({ title: '\u5DF2\u590D\u5236\u5206\u4EAB\u7801', icon: 'success' }),
  })
}

function importFromPaste() {
  try {
    const payload = decodePaletteShare(pasteCode.value)
    emit('import', payload)
    pasteCode.value = ''
  } catch (error) {
    showToast({ title: (error as Error).message || '\u89E3\u6790\u5931\u8D25', icon: 'none' })
  }
}
</script>

<template>
  <PDrawer :model-value="show" title="分享 / 导入色板" @update:model-value="(v) => !v && emit('close')">
    <p class="hint">复制分享码或粘贴，可在另一设备导入相同色板</p>
    <div v-if="entries.length" class="code-box">
      <textarea readonly :value="shareCode" rows="4" />
      <PButton size="sm" @click="copyShareCode">复制分享码</PButton>
    </div>
    <div class="section">
      <label>粘贴分享码导入</label>
      <textarea v-model="pasteCode" class="paste-area" placeholder="粘贴 pindou-palette-v1:..." />
      <PButton type="primary" block @click="importFromPaste">解析导入</PButton>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.hint {
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  margin-bottom: 12px;
}

.code-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  textarea {
    width: 100%;
    font-size: 11px;
    border: 1px solid $pindou-border;
    border-radius: $pindou-radius-sm;
    padding: 8px;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: $pindou-font-sm;
    color: $pindou-text-secondary;
  }
}

.paste-area {
  width: 100%;
  min-height: 80px;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  padding: 8px;
}
</style>