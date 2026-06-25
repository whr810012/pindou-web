import { compressImageForAi } from '@/utils/compressImageForAi'
import { getJimengApiKey, hasJimengApiKey } from '@/utils/aiKeyStorage'

export type AiPreprocessStyle = 'cartoon' | 'sketch' | 'flat' | 'enhance' | 'matting'

export interface AiPreprocessOptions {
  style: AiPreprocessStyle
}

export const AI_MOCK_ENABLED = import.meta.env.VITE_AI_MOCK === 'true'

const DEV_AI_URL = 'http://127.0.0.1:8787/api/ai-preprocess'

const ENDPOINT =
  import.meta.env.VITE_AI_PREPROCESS_URL ||
  (import.meta.env.PROD ? '/.netlify/functions/ai-preprocess' : DEV_AI_URL)

export const AI_PREPROCESS_ENABLED = Boolean(ENDPOINT) && !AI_MOCK_ENABLED

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

export async function runAiPreprocess(
  imagePath: string,
  options: AiPreprocessOptions,
  credentialsOverride?: string,
): Promise<string> {
  if (AI_MOCK_ENABLED) {
    const { runLocalAiMock } = await import('@/utils/aiPreprocessLocal')
    return runLocalAiMock(imagePath, options.style)
  }

  if (!ENDPOINT) {
    throw new Error('AI 预处理未配置，请设置 VITE_AI_PREPROCESS_URL')
  }

  const apiKey = (credentialsOverride ?? getJimengApiKey()).trim()
  if (!apiKey) {
    throw new Error('请先配置火山引擎凭证（API Key 或 AccessKey）')
  }

  const image = await compressImageForAi(imagePath)

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, style: options.style, apiKey }),
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

  if (data.imageUrl) {
    return await fetchImageAsDataUrl(data.imageUrl)
  }

  if (data.image) {
    return data.image.startsWith('data:') ? data.image : `data:image/png;base64,${data.image}`
  }

  throw new Error('AI 服务未返回有效图片')
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
