<script setup lang="ts">
import { ref } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { showToast } from '@/utils/platform-ui'
import { XHS_IMPORT_ENABLED, parseXhsShareText, type XhsParseImage } from '@/utils/xhsImport'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [dataUrl: string]
}>()

const shareText = ref('')
const loading = ref(false)
const images = ref<XhsParseImage[]>([])

function reset() {
  shareText.value = ''
  images.value = []
  loading.value = false
}

function onClose() {
  reset()
  emit('close')
}

async function parse() {
  const text = shareText.value.trim()
  if (!text) {
    showToast({ title: '请粘贴分享文案或链接', icon: 'none' })
    return
  }

  loading.value = true
  images.value = []
  try {
    images.value = await parseXhsShareText(text)
    showToast({ title: `解析到 ${images.value.length} 张图`, icon: 'success' })
  } catch (error) {
    showToast({ title: (error as Error).message || '解析失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function pickImage(image: XhsParseImage) {
  emit('select', image.dataUrl)
  onClose()
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && onClose()">
    <div class="craft-drawer">
      <span class="craft-drawer__title">小红书导入</span>
      <p class="craft-hint">
        粘贴小红书分享文案或短链，由本站解析笔记图片。链接与图片会经服务器转发，请知悉隐私说明。
        解析失败时请手动保存图片后上传。
      </p>

      <p v-if="!XHS_IMPORT_ENABLED" class="craft-callout">
        未配置解析服务。开发环境请运行 <code>npm run dev:xhs</code> 并设置
        <code>VITE_XHS_PARSE_URL</code>。
      </p>

      <textarea
        v-model="shareText"
        class="craft-textarea"
        rows="4"
        placeholder="粘贴小红书分享文案、短链，或 discovery/explore 笔记链接"
      />

      <PButton
        type="primary"
        block
        :text="loading ? '解析中...' : '解析图片'"
        :loading="loading"
        :disabled="!XHS_IMPORT_ENABLED || loading"
        @click="parse"
      />

      <div v-if="images.length" class="craft-thumb-grid">
        <button
          v-for="image in images"
          :key="image.id"
          type="button"
          class="craft-thumb-btn"
          @click="pickImage(image)"
        >
          <img :src="image.preview" alt="" />
        </button>
      </div>
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.craft-textarea {
  margin-bottom: 12px;
}
</style>
