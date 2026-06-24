<script setup lang="ts">
import { ref } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { showToast } from '@/utils/platform-ui'
import { AI_MOCK_ENABLED, AI_PREPROCESS_ENABLED, AI_STYLE_OPTIONS, runAiPreprocess } from '@/utils/aiPreprocess'
import type { AiPreprocessStyle } from '@/utils/aiPreprocess'

const props = defineProps<{
  show: boolean
  imagePath: string
}>()

const emit = defineEmits<{
  close: []
  done: [path: string]
}>()

const style = ref<AiPreprocessStyle>('cartoon')
const loading = ref(false)

async function run() {
  if (!props.imagePath) return
  loading.value = true
  try {
    const result = await runAiPreprocess(props.imagePath, { style: style.value })
    emit('done', result)
    emit('close')
  } catch (error) {
    showToast({ title: (error as Error).message || '处理失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="sheet">
      <span class="title">AI 预处理</span>
      <span class="hint">
        {{
          AI_MOCK_ENABLED
            ? '本地 Mock 已开启：将用 Canvas 滤镜模拟 AI 效果（H5）'
            : AI_PREPROCESS_ENABLED
              ? '选择风格后云端处理，结果将用于像素化'
              : '第二期功能：设置 VITE_AI_MOCK 或 VITE_AI_PREPROCESS_URL 后可用'
        }}
      </span>

      <div class="styles">
        <div
          v-for="item in AI_STYLE_OPTIONS"
          :key="item.value"
          class="style-card"
          :class="{ active: style === item.value }"
          @click="style = item.value"
        >
          <span class="style-label">{{ item.label }}</span>
          <span class="style-desc">{{ item.desc }}</span>
        </div>
      </div>

      <PButton
        type="primary"
        :text="loading ? '处理中...' : AI_MOCK_ENABLED || AI_PREPROCESS_ENABLED ? '开始处理' : '即将上线'"
        :loading="loading"
        @click="run"
      />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.sheet {
  padding: 16px;
}

.title {
  display: block;
  font-weight: 600;
  font-size: 16px;
}

.hint {
  display: block;
  margin: 6px 0 14px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

.styles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.style-card {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px;
}

.style-card.active {
  border-color: #2979ff;
  background: #f0f7ff;
}

.style-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
}

.style-desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #888;
}
</style>
