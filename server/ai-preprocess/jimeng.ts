/**
 * 火山引擎 / 即梦 图像生成
 *
 * 支持两种鉴权：
 * 1. Ark API Key（Bearer）→ OpenAI 兼容 Endpoint
 * 2. IAM AccessKey（AK/SK）→ visual.volcengineapi.com 图生图
 */

import type { JimengCredentials } from './credentials'
import { callJimengVisualApi } from './jimengVisual'
import { styleToPrompt } from './prompts'

export { styleToPrompt } from './prompts'

export const DEFAULT_JIMENG_ENDPOINT =
  'https://ark.cn-beijing.volces.com/api/v3/images/generations'

export const DEFAULT_JIMENG_MODEL = 'doubao-seedream-4-0-250828'

interface JimengImageData {
  url?: string
  b64_json?: string
}

interface JimengResponse {
  data?: JimengImageData[]
  error?: { message?: string; code?: string }
  message?: string
}

export async function callJimengApi(options: {
  credentials: JimengCredentials
  endpoint?: string
  model?: string
  visualReqKey?: string
  image: string
  style: string
}): Promise<{ image?: string; imageUrl?: string }> {
  if (options.credentials.type === 'aksk') {
    return callJimengVisualApi({
      accessKeyId: options.credentials.accessKeyId,
      secretAccessKey: options.credentials.secretAccessKey,
      image: options.image,
      style: options.style,
      reqKey: options.visualReqKey,
    })
  }

  return callJimengBearerApi({
    apiKey: options.credentials.apiKey,
    endpoint: options.endpoint,
    model: options.model,
    image: options.image,
    style: options.style,
  })
}

async function callJimengBearerApi(options: {
  apiKey: string
  endpoint?: string
  model?: string
  image: string
  style: string
}): Promise<{ image?: string; imageUrl?: string }> {
  if (/[\r\n]/.test(options.apiKey) || /secretaccesskey/i.test(options.apiKey)) {
    throw new Error(
      '检测到 AccessKey 格式，不能使用 Bearer 调用。请重启 npm run dev:ai 后重试，或仅粘贴单行 Ark API Key',
    )
  }

  const endpoint = options.endpoint || DEFAULT_JIMENG_ENDPOINT
  const model = options.model || DEFAULT_JIMENG_MODEL
  const prompt = styleToPrompt(options.style)

  const body = {
    model,
    prompt,
    image: options.image,
    size: '1K',
    scale: 0.65,
    force_single: true,
    watermark: false,
    response_format: 'url',
    optimize_prompt_options: { mode: 'fast' },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  })

  const data = (await response.json()) as JimengResponse

  if (!response.ok) {
    const msg =
      data.error?.message || data.message || `即梦 API 错误 ${response.status}`
    if (response.status === 401) {
      throw new Error(
        `API Key 校验失败（401）。请确认：① Key 来自 Ark 控制台且未禁用；② 已开通 Seedream 图生图；③ 粘贴完整单行密钥无多余空格。${msg !== `即梦 API 错误 ${response.status}` ? ` 详情：${msg}` : ''}`,
      )
    }
    if (response.status === 413) throw new Error('图片过大，请缩小后重试')
    throw new Error(msg)
  }

  const first = data.data?.[0]
  if (!first) throw new Error('即梦 API 未返回图片数据')

  if (first.url) return { imageUrl: first.url }

  if (first.b64_json) {
    const image = first.b64_json.startsWith('data:')
      ? first.b64_json
      : `data:image/png;base64,${first.b64_json}`
    return { image }
  }

  throw new Error('即梦 API 响应格式无法解析')
}
