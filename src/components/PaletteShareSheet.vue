<script setup lang="ts">
import type { PaletteEntry } from '@wangdandan810012/bead-core'
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
    success: () => showToast({ title: '已复制分享码', icon: 'success' }),
  })
}

function importFromPaste() {
  try {
    const payload = decodePaletteShare(pasteCode.value)
    emit('import', payload)
    pasteCode.value = ''
  } catch (error) {
    showToast({ title: (error as Error).message || '解析失败', icon: 'none' })
  }
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="craft-drawer">
      <span class="craft-drawer__title">分享 / 导入色板</span>
      <p class="craft-hint">复制分享码或粘贴，可在另一设备导入相同色板</p>

      <div v-if="entries.length" class="share-block">
        <span class="craft-label">分享码</span>
        <textarea class="craft-textarea share-code" readonly :value="shareCode" rows="4" />
        <PButton size="sm" plain text="复制分享码" @click="copyShareCode" />
      </div>

      <div class="share-block">
        <span class="craft-label">粘贴导入</span>
        <textarea
          v-model="pasteCode"
          class="craft-textarea"
          rows="4"
          placeholder="粘贴 pindou-palette-v1:..."
        />
        <PButton type="primary" block text="解析导入" @click="importFromPaste" />
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.share-block {
  margin-bottom: 18px;

  .craft-label {
    margin-bottom: 8px;
  }

  .craft-textarea {
    margin-bottom: 10px;
  }
}

.share-code {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: $pindou-text-secondary;
}
</style>
