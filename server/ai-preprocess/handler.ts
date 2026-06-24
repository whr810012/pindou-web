import { resolveJimengCredentials, validateAkskCredentials } from './credentials'
import { callJimengApi, styleToPrompt } from './jimeng'
import type { AiPreprocessRequest, AiPreprocessResponse, HandlerEnv } from './types'

const DEFAULT_MAX_IMAGE_BYTES = 4 * 1024 * 1024

export function corsHeaders(origin = '*', contentType = 'application/json'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': contentType,
  }
}

export function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return Math.floor((base64.length * 3) / 4)
}

export async function handleAiPreprocess(
  body: AiPreprocessRequest,
  env: HandlerEnv = {},
): Promise<{ status: number; body: AiPreprocessResponse }> {
  const image = body.image ?? ''
  const style = body.style ?? 'cartoon'
  const maxBytes = env.maxImageBytes ?? DEFAULT_MAX_IMAGE_BYTES

  if (!image) {
    return { status: 400, body: { error: 'image required' } }
  }

  if (estimateBase64Bytes(image) > maxBytes) {
    return { status: 413, body: { error: '图片过大，请压缩至 4MB 以内后重试' } }
  }

  const credentials = resolveJimengCredentials(
    body.apiKey ? String(body.apiKey) : undefined,
    {
      accessKeyId: env.jimengAccessKeyId,
      secretAccessKey: env.jimengSecretAccessKey,
      apiKey: env.jimengApiKey,
    },
  )

  if (!credentials) {
    return {
      status: 400,
      body: {
        error:
          '凭证格式无法识别。请粘贴 Ark API Key（单行），或 AccessKey.txt 全文（含 AccessKeyId 与 SecretAccessKey 两行）',
      },
    }
  }

  if (credentials.type === 'aksk') {
    const akskError = validateAkskCredentials(credentials)
    if (akskError) {
      return { status: 400, body: { error: akskError } }
    }
  }

  if (credentials.type === 'bearer' && credentials.apiKey === 'mock') {
    return {
      status: 200,
      body: { image, mock: true, prompt: styleToPrompt(style) },
    }
  }

  try {
    const result = await callJimengApi({
      credentials,
      endpoint: env.jimengEndpoint,
      model: env.jimengModel,
      visualReqKey: env.jimengVisualReqKey,
      image,
      style,
    })
    return { status: 200, body: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 处理失败'
    if (message.includes('timeout') || message.includes('aborted') || message.includes('超时')) {
      return { status: 504, body: { error: 'AI 处理超时，请缩小图片后重试' } }
    }
    return { status: 502, body: { error: message } }
  }
}
