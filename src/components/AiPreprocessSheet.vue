<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast } from '@/utils/platform-ui'
import {
  AI_MOCK_ENABLED,
  AI_PREPROCESS_ENABLED,
  AI_STYLE_OPTIONS,
  isAiTimeoutError,
  runAiPreprocess,
} from '@/utils/aiPreprocess'
import type { AiPreprocessProgress, AiPreprocessStyle } from '@/utils/aiPreprocess'
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

const style = ref<AiPreprocessStyle>('enhance')
const loading = ref(false)
const apiKeyDraft = ref('')
const showKey = ref(false)
const progress = ref<AiPreprocessProgress | null>(null)
const lastError = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      apiKeyDraft.value = getJimengApiKey()
      progress.value = null
      lastError.value = ''
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
  if (loading.value) return false
  if (AI_MOCK_ENABLED) return true
  if (!AI_PREPROCESS_ENABLED) return false
  return Boolean(apiKeyDraft.value.trim()) || hasJimengApiKeyFromStorage()
})

const runButtonText = computed(() => {
  if (loading.value) return '处理中…'
  if (lastError.value) return '重试'
  if (AI_MOCK_ENABLED) return '开始处理（Mock）'
  if (!AI_PREPROCESS_ENABLED) return '服务未配置'
  if (!apiKeyDraft.value.trim() && !hasJimengApiKeyFromStorage()) return '请先填写凭证'
  return '开始处理'
})

const progressPercent = computed(() => progress.value?.percent ?? 0)
const progressMessage = computed(() => progress.value?.message ?? '')

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

function onProgress(update: AiPreprocessProgress) {
  progress.value = update
}

async function run(forceAggressive = false) {
  if (!props.imagePath || (!canRun.value && !lastError.value)) return

  if (!AI_MOCK_ENABLED && apiKeyDraft.value.trim()) {
    setJimengApiKey(apiKeyDraft.value)
  }

  loading.value = true
  lastError.value = ''
  progress.value = null

  try {
    const result = await runAiPreprocess(
      props.imagePath,
      {
        style: style.value,
        onProgress,
        autoRetryOnTimeout: !forceAggressive,
        compress: forceAggressive
          ? { maxEdge: 512, quality: 0.72, maxBytes: 2 * 1024 * 1024 }
          : undefined,
      },
      apiKeyDraft.value.trim(),
    )
    emit('done', result)
    emit('close')
  } catch (error) {
    const message = (error as Error).message || '处理失败'
    lastError.value = message
    if (isAiTimeoutError(message)) {
      showToast({
        title: '处理超时，可点「缩小重试」或换更小图片',
        icon: 'none',
      })
    } else {
      showToast({ title: message, icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

function retryAggressive() {
  run(true)
}

onUnmounted(() => {
  progress.value = null
})
</script>

<template>
  <PDrawer :model-value="show" @update:model-value="(v) => !v && emit('close')">
    <div class="craft-drawer">
      <span class="craft-drawer__title">AI 预处理</span>
      <p class="craft-hint">{{ hintText }}</p>

      <div v-if="!AI_MOCK_ENABLED && AI_PREPROCESS_ENABLED" class="key-section">
        <label class="craft-label" for="jimeng-api-key">火山引擎凭证</label>
        <div class="key-row">
          <textarea
            id="jimeng-api-key"
            v-model="apiKeyDraft"
            class="craft-textarea key-input"
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
          <span v-if="item.value === 'matting'" class="style-note">
            适合人物/主体图；复杂背景效果因原图而异
          </span>
        </div>
      </div>

      <div v-if="loading && progress" class="progress-block">
        <PLineProgress :percentage="progressPercent" :height="10" />
        <p class="progress-msg">{{ progressMessage }}</p>
      </div>

      <div v-if="lastError && !loading" class="error-block">
        <p class="error-text">{{ lastError }}</p>
        <PButton
          v-if="isAiTimeoutError(lastError)"
          plain
          size="sm"
          text="缩小图片重试"
          @click="retryAggressive"
        />
      </div>

      <PButton
        type="primary"
        block
        :text="runButtonText"
        :loading="loading"
        :disabled="!canRun && !lastError"
        @click="run()"
      />
    </div>
  </PDrawer>
</template>

<style scoped lang="scss">
.key-section {
  margin-bottom: 16px;
}

.key-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.key-input--masked {
  -webkit-text-security: disc;
}

.key-toggle {
  flex-shrink: 0;
  border: 1px solid $pindou-border;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-subtle;
  padding: 8px 10px;
  font-size: $pindou-font-xs;
  font-weight: 600;
  color: $pindou-text-secondary;
  cursor: pointer;

  &:hover {
    border-color: rgba($pindou-primary, 0.3);
    color: $pindou-primary;
  }
}

.key-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.key-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.key-link {
  font-size: $pindou-font-xs;
  color: $pindou-primary;
  text-decoration: none;

  &--secondary {
    color: $pindou-text-muted;
  }

  &:hover {
    text-decoration: underline;
  }
}

.privacy-note {
  margin: 10px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
  line-height: 1.45;
}

.styles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.style-card {
  padding: 12px 14px;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-subtle;
  cursor: pointer;
  transition: border-color $pindou-duration-fast, background $pindou-duration-fast,
    box-shadow $pindou-duration-fast;

  &:hover {
    border-color: rgba($pindou-primary, 0.25);
  }

  &.active {
    border-color: rgba($pindou-primary, 0.45);
    background: rgba($pindou-primary-light, 0.6);
    box-shadow: $pindou-shadow-sm;
  }
}

.style-label {
  display: block;
  font-weight: 700;
  font-size: $pindou-font-sm;
  color: $pindou-text;
}

.style-desc {
  display: block;
  margin-top: 2px;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
}

.style-note {
  display: block;
  margin-top: 6px;
  font-size: $pindou-font-xs;
  color: $pindou-accent;
}

.progress-block {
  margin-bottom: 14px;
}

.progress-msg {
  margin: 8px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
}

.error-block {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: $pindou-radius-sm;
  background: rgba($pindou-warning, 0.08);
  border: 1px solid rgba($pindou-warning, 0.2);
}

.error-text {
  margin: 0 0 8px;
  font-size: $pindou-font-xs;
  color: $pindou-warning;
  line-height: 1.45;
}
</style>
