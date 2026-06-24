<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import { showToast } from '@/utils/platform-ui'
import {
  AI_MOCK_ENABLED,
  AI_PREPROCESS_ENABLED,
  AI_STYLE_OPTIONS,
  runAiPreprocess,
} from '@/utils/aiPreprocess'
import type { AiPreprocessStyle } from '@/utils/aiPreprocess'
import {
  clearJimengApiKey,
  getJimengApiKey,
  JIMENG_ARK_API_KEY_URL,
  JIMENG_IAM_KEY_URL,
  JIMENG_VISUAL_DOC_URL,
  setJimengApiKey,
} from '@/utils/aiKeyStorage'

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
const apiKeyDraft = ref('')
const showKey = ref(false)

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      apiKeyDraft.value = getJimengApiKey()
    }
  },
  { immediate: true },
)

const hintText = computed(() => {
  if (AI_MOCK_ENABLED) {
    return '本地 Mock 已开启：将用 Canvas 滤镜模拟 AI 效果，无需 API Key'
  }
  if (!AI_PREPROCESS_ENABLED) {
    return '请配置 VITE_AI_PREPROCESS_URL 或使用生产部署（Netlify Functions）'
  }
  if (!apiKeyDraft.value.trim()) {
    return '图像生成大模型：粘贴 AccessKey.txt（AK/SK）。方舟用户可粘贴 Ark API Key 单行'
  }
  return '图片将经本站转发至火山引擎处理，结果用于后续像素化。请确认你已了解相关隐私说明'
})

function hasJimengApiKeyFromStorage() {
  return getJimengApiKey().length > 0
}

const canRun = computed(() => {
  if (!props.imagePath) return false
  if (AI_MOCK_ENABLED) return true
  if (!AI_PREPROCESS_ENABLED) return false
  return Boolean(apiKeyDraft.value.trim()) || hasJimengApiKeyFromStorage()
})

const runButtonText = computed(() => {
  if (loading.value) return '处理中...'
  if (AI_MOCK_ENABLED) return '开始处理（Mock）'
  if (!AI_PREPROCESS_ENABLED) return '服务未配置'
  if (!apiKeyDraft.value.trim()) return '请先填写凭证'
  return '开始处理'
})

function saveKey() {
  const key = apiKeyDraft.value.trim()
  if (!key) {
    showToast({ title: '请输入 API Key', icon: 'none' })
    return
  }
  setJimengApiKey(key)
  showToast({ title: '已保存到本机', icon: 'success' })
}

function onClearKey() {
  apiKeyDraft.value = ''
  clearJimengApiKey()
  showToast({ title: '已清除 API Key', icon: 'none' })
}

async function run() {
  if (!props.imagePath || !canRun.value) return

  if (!AI_MOCK_ENABLED && apiKeyDraft.value.trim()) {
    setJimengApiKey(apiKeyDraft.value)
  }

  loading.value = true
  try {
    const result = await runAiPreprocess(props.imagePath, { style: style.value }, apiKeyDraft.value.trim())
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
      <span class="hint">{{ hintText }}</span>

      <div v-if="!AI_MOCK_ENABLED && AI_PREPROCESS_ENABLED" class="key-section">
        <label class="key-label" for="jimeng-api-key">火山引擎凭证</label>
        <div class="key-row">
          <textarea
            id="jimeng-api-key"
            v-model="apiKeyDraft"
            class="key-input key-input--area"
            :class="{ 'key-input--masked': !showKey }"
            placeholder="推荐：Ark API Key 或 ApiKey.txt / AccessKey.txt 全文"
            autocomplete="off"
            rows="3"
          />
          <button type="button" class="key-toggle" @click="showKey = !showKey">
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
        <div class="key-actions">
          <PButton plain size="sm" text="保存到本机" @click="saveKey" />
          <PButton plain size="sm" text="清除" @click="onClearKey" />
        </div>
        <div class="key-links">
          <a
            class="key-link"
            :href="JIMENG_VISUAL_DOC_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            图像生成大模型文档（推荐）→
          </a>
          <a class="key-link key-link--secondary" :href="JIMENG_IAM_KEY_URL" target="_blank" rel="noopener noreferrer">
            IAM AccessKey →
          </a>
          <a class="key-link key-link--secondary" :href="JIMENG_ARK_API_KEY_URL" target="_blank" rel="noopener noreferrer">
            方舟 Ark API Key →
          </a>
        </div>
        <p class="privacy-note">
          你使用的文档属于「图像生成大模型」，请用 AccessKey.txt（AK/SK）并开通智能绘图服务、绑定
          CVFullAccess。Ark API Key 属于火山方舟另一条产品线。
        </p>
      </div>

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
        :text="runButtonText"
        :loading="loading"
        :disabled="!canRun"
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

.key-section {
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f8fa;
}

.key-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
}

.key-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-input {
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
}

.key-input--area {
  resize: vertical;
  min-height: 72px;
}

.key-input--masked {
  -webkit-text-security: disc;
}

.key-toggle {
  flex-shrink: 0;
  padding: 0 10px;
  border: none;
  background: transparent;
  color: #2979ff;
  font-size: 12px;
  cursor: pointer;
}

.key-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.key-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 8px;
}

.key-link {
  display: inline-block;
  font-size: 12px;
  color: #2979ff;
  text-decoration: none;
}

.key-link--secondary {
  color: #666;
}

.privacy-note {
  margin: 8px 0 0;
  font-size: 11px;
  color: #999;
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
  cursor: pointer;
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
