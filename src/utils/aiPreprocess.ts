import { compressImageForAi, type CompressImageOptions } from '@/utils/compressImageForAi'
import { getJimengApiKey, hasJimengApiKey } from '@/utils/aiKeyStorage'

export type AiPreprocessStyle = 'cartoon' | 'sketch' | 'flat' | 'enhance' | 'matting'

export interface AiPreprocessOptions {
  style: AiPreprocessStyle
}

export type AiPreprocessStage = 'compress' | 'upload' | 'process'

export interface AiPreprocessProgress {
  stage: AiPreprocessStage
  percent: number
  message: string
}

export interface AiPreprocessRunOptions extends AiPreprocessOptions {
  compress?: CompressImageOptions
  onProgress?: (progress: AiPreprocessProgress) => void
  /** 504 时自动用更小图重试一次 */
  autoRetryOnTimeout?: boolean
}

export const AI_MOCK_ENABLED = import.meta.env.VITE_AI_MOCK === 'true'

const DEV_AI_URL = 'http://127.0.0.1:8787/api/ai-preprocess'

const ENDPOINT =
  import.meta.env.VITE_AI_PREPROCESS_URL ||
  (import.meta.env.PROD ? '/.netlify/functions/ai-preprocess' : DEV_AI_URL)

export const AI_PREPROCESS_ENABLED = Boolean(ENDPOINT) && !AI_MOCK_ENABLED

const STAGE_MESSAGES: Record<AiPreprocessStage, string> = {
  compress: '正在压缩图片…',
  upload: '正在上传…',
  process: 'AI 处理中，约需 10～25 秒…',
}

const AGGRESSIVE_COMPRESS: CompressImageOptions = {
  maxEdge: 512,
  quality: 0.75,
  maxBytes: 2 * 1024 * 1024,
}

export const AI_STYLE_OPTIONS: Array<{ label: string; value: AiPreprocessStyle; desc: string }> = [
  { label: '卡通扁平', value: 'cartoon', desc: '大色块卡通，适合可爱图案' },
  { label: '线稿强化', value: 'sketch', desc: '轮廓清晰，方便填色' },
  { label: '色块简化', value: 'flat', desc: '海报扁平，颜色更少' },
  { label: '清晰增强', value: 'enhance', desc: '贴近原图，锐化边缘' },
  { label: '去背景', value: 'matting', desc: '抠图清底，适合人物/主体图' },
]

export function isAiPreprocessAvailable(credentialsDraft = ''): boolean {
  if (AI_MOCK_ENABLED) return true
  if (!AI_PREPROCESS_ENABLED) return false
  return hasJimengApiKey() || Boolean(credentialsDraft.trim())
}

export function isAiTimeoutError(message: string): boolean {
  return /504|超时|timeout/i.test(message)
}

export async function runAiPreprocess(
  imagePath: string,
  options: AiPreprocessRunOptions,
  credentialsOverride?: string,
): Promise<string> {
  if (AI_MOCK_ENABLED) {
    const { runLocalAiMock } = await import('@/utils/aiPreprocessLocal')
    options.onProgress?.({ stage: 'process', percent: 50, message: 'Mock 处理中…' })
    const result = await runLocalAiMock(imagePath, options.style)
    options.onProgress?.({ stage: 'process', percent: 100, message: '完成' })
    return result
  }

  if (!ENDPOINT) {
    throw new Error('AI 预处理未配置，请设置 VITE_AI_PREPROCESS_URL')
  }

  const apiKey = (credentialsOverride ?? getJimengApiKey()).trim()
  if (!apiKey) {
    throw new Error('请先配置火山引擎凭证（API Key 或 AccessKey）')
  }

  const compressOpts = options.compress ?? {}
  const autoRetry = options.autoRetryOnTimeout !== false

  try {
    return await runOnce(imagePath, options.style, apiKey, compressOpts, options.onProgress)
  } catch (error) {
    const message = (error as Error).message || '处理失败'
    if (!autoRetry || !isAiTimeoutError(message)) {
      throw error
    }
    options.onProgress?.({
      stage: 'compress',
      percent: 5,
      message: '请求超时，正在缩小图片后重试…',
    })
    return await runOnce(imagePath, options.style, apiKey, AGGRESSIVE_COMPRESS, options.onProgress)
  }
}

async function runOnce(
  imagePath: string,
  style: AiPreprocessStyle,
  apiKey: string,
  compressOpts: CompressImageOptions,
  onProgress?: (progress: AiPreprocessProgress) => void,
): Promise<string> {
  onProgress?.({ stage: 'compress', percent: 8, message: STAGE_MESSAGES.compress })
  const image = await compressImageForAi(imagePath, compressOpts)
  onProgress?.({ stage: 'upload', percent: 22, message: STAGE_MESSAGES.upload })

  const stopTick = startProcessTicker(onProgress)

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, style, apiKey }),
    })

    const data = (await response.json()) as {
      imageUrl?: string
      image?: string
      error?: string
    }

    if (!response.ok) {
      throw new Error(data.error || `AI 服务错误 ${response.status}`)
    }

    if (data.error) {
      throw new Error(data.error)
    }

    onProgress?.({ stage: 'process', percent: 92, message: '正在下载结果…' })

    if (data.imageUrl) {
      const result = await fetchImageAsDataUrl(data.imageUrl)
      onProgress?.({ stage: 'process', percent: 100, message: '完成' })
      return result
    }

    if (data.image) {
      onProgress?.({ stage: 'process', percent: 100, message: '完成' })
      return data.image.startsWith('data:') ? data.image : `data:image/png;base64,${data.image}`
    }

    throw new Error('AI 服务未返回有效图片')
  } finally {
    stopTick()
  }
}

function startProcessTicker(onProgress?: (progress: AiPreprocessProgress) => void): () => void {
  if (!onProgress) return () => {}

  let percent = 28
  onProgress({ stage: 'process', percent, message: STAGE_MESSAGES.process })

  const timer = window.setInterval(() => {
    percent = Math.min(88, percent + 2)
    onProgress({ stage: 'process', percent, message: STAGE_MESSAGES.process })
  }, 1200)

  return () => window.clearInterval(timer)
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('无法下载 AI 处理结果')
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
