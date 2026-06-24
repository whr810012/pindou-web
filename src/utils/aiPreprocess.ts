export type AiPreprocessStyle = 'cartoon' | 'sketch' | 'flat' | 'enhance'

export interface AiPreprocessOptions {
  style: AiPreprocessStyle
}

export const AI_PREPROCESS_ENABLED = import.meta.env.VITE_AI_PREPROCESS_URL ? true : false
export const AI_MOCK_ENABLED = import.meta.env.VITE_AI_MOCK === 'true'

export const AI_STYLE_OPTIONS: Array<{ label: string; value: AiPreprocessStyle; desc: string }> = [
  { label: '卡通扁平', value: 'cartoon', desc: '减少渐变，适合拼豆' },
  { label: '线稿强化', value: 'sketch', desc: '突出轮廓与色块' },
  { label: '色块简化', value: 'flat', desc: '降低细节噪点' },
  { label: '清晰增强', value: 'enhance', desc: '提升边缘清晰度' },
]

const ENDPOINT = import.meta.env.VITE_AI_PREPROCESS_URL ?? ''

export async function runAiPreprocess(
  imagePath: string,
  options: AiPreprocessOptions,
): Promise<string> {
  if (AI_MOCK_ENABLED) {
    const { runLocalAiMock } = await import('@/utils/aiPreprocessLocal')
    return runLocalAiMock(imagePath, options.style)
  }

  if (!AI_PREPROCESS_ENABLED || !ENDPOINT) {
    throw new Error('AI 预处理即将上线，敬请期待')
  }

  const fileData = await readImageAsBase64(imagePath)
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: fileData, style: options.style }),
  })
  if (!response.ok) throw new Error(`AI 服务错误 ${response.status}`)
  const data = (await response.json()) as { imageUrl?: string; image?: string }
  if (data.imageUrl) return data.imageUrl
  if (data.image) return data.image.startsWith('data:') ? data.image : `data:image/png;base64,${data.image}`
  throw new Error('AI 服务未返回有效图片')
}

function readImageAsBase64(path: string): Promise<string> {
  return fetch(path)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )
}
