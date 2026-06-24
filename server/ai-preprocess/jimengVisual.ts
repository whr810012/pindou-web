import { Service } from '@volcengine/openapi'
import { styleEditScale, styleToPrompt } from './prompts'

const VISUAL_HOST = 'visual.volcengineapi.com'
const VISUAL_REGION = 'cn-north-1'
const VISUAL_SERVICE = 'cv'
const API_VERSION = '2022-08-31'
/** 图像生成大模型 · 图生图3.0 SeedEdit 3.0，见 https://www.volcengine.com/docs/86081/1804561 */
const DEFAULT_VISUAL_REQ_KEY = 'seededit_v3.0'

export function resolveVisualReqKey(override?: string): string {
  return override?.trim() || process.env.JIMENG_VISUAL_REQ_KEY?.trim() || DEFAULT_VISUAL_REQ_KEY
}

interface VisualResponse {
  code?: number
  message?: string
  data?: {
    task_id?: string
    status?: string
    image_urls?: string[]
    binary_data_base64?: string[]
  }
  ResponseMetadata?: {
    RequestId?: string
    Error?: { Code?: string; Message?: string }
  }
}

export async function callJimengVisualApi(options: {
  accessKeyId: string
  secretAccessKey: string
  image: string
  style: string
  reqKey?: string
}): Promise<{ image?: string; imageUrl?: string }> {
  const prompt = styleToPrompt(options.style)
  const base64 = stripDataUrl(options.image)
  const reqKey = resolveVisualReqKey(options.reqKey)

  const submitBody = buildVisualSubmitBody(reqKey, prompt, base64, options.style)

  const submit = await signedVisualRequest(
    options.accessKeyId,
    options.secretAccessKey,
    'CVSync2AsyncSubmitTask',
    submitBody,
  )

  const taskId = submit.data?.task_id
  if (!taskId) {
    throw new Error(submit.message || '即梦任务提交失败，未返回 task_id')
  }

  const deadline = Date.now() + 22_000
  while (Date.now() < deadline) {
    await sleep(800)

    const result = await signedVisualRequest(
      options.accessKeyId,
      options.secretAccessKey,
      'CVSync2AsyncGetResult',
      { req_key: reqKey, task_id: taskId },
    )

    const status = result.data?.status?.toLowerCase()
    if (status === 'done' || status === 'success' || status === 'succeed') {
      const url = result.data?.image_urls?.[0]
      if (url) return { imageUrl: url }

      const b64 = result.data?.binary_data_base64?.[0]
      if (b64) {
        return {
          image: b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`,
        }
      }
      throw new Error('即梦任务完成但未返回图片')
    }

    if (status === 'failed' || status === 'error' || status === 'not_pass') {
      throw new Error(result.message || '即梦图片生成失败')
    }
  }

  throw new Error('即梦处理超时，请缩小图片后重试')
}

async function signedVisualRequest(
  accessKeyId: string,
  secretAccessKey: string,
  action: string,
  body: Record<string, unknown>,
): Promise<VisualResponse> {
  const service = new Service({
    host: VISUAL_HOST,
    region: VISUAL_REGION,
    serviceName: VISUAL_SERVICE,
    protocol: 'https:',
    accessKeyId,
    secretKey: secretAccessKey,
  })

  const request = service.createJSONAPI(action, { Version: API_VERSION })
  const data = (await request(body)) as VisualResponse

  if (data.ResponseMetadata?.Error || (data.code !== undefined && data.code !== 10000)) {
    throw new Error(formatVisualApiError(data))
  }

  return data
}

function formatVisualApiError(data: VisualResponse): string {
  const code = data.ResponseMetadata?.Error?.Code ?? ''
  const message = data.ResponseMetadata?.Error?.Message || data.message || '即梦 API 调用失败'
  const requestId = data.ResponseMetadata?.RequestId
  const combined = `${code} ${message}`.toLowerCase()
  const requestHint = requestId ? `\nRequestId: ${requestId}（提交火山工单时可附上）` : ''

  if (combined.includes('signature') || combined.includes('invalid authorization')) {
    return 'AccessKey 无效或签名错误，请检查 AK/SK 是否完整、未多余空格' + requestHint
  }

  if (combined.includes('access denied') || combined.includes('accessdenied')) {
    return [
      'IAM AccessKey 无权调用图像生成大模型（Access Denied）。',
      '你已开通服务且为主账号，请重点检查：',
      '1. 在「开通服务」之后重新创建一把新 AccessKey（旧 Key 可能无 API 权限）',
      '2. IAM → 用户 → 主账号 → 权限 → 添加 CVFullAccess（全局，主账号有时也需显式绑定）',
      '3. 确认 SecretAccessKey 从 AccessKey.txt 原样粘贴，不要做 base64 解码',
      '4. 在控制台 API Explorer 搜索 CVSync2AsyncSubmitTask 用同 AK 试调',
      '5. 策略变更后等待 10 分钟',
      '权限说明：https://www.volcengine.com/docs/86081/1660350',
    ].join('\n') + requestHint
  }

  if (message && code && message !== code) {
    return `${code}: ${message}`
  }
  return message || code || '即梦 API 调用失败'
}

function buildVisualSubmitBody(
  reqKey: string,
  prompt: string,
  base64: string,
  style: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    req_key: reqKey,
    prompt,
    binary_data_base64: [base64],
    scale: styleEditScale(style),
    seed: -1,
  }
  if (reqKey.startsWith('jimeng_')) {
    body.width = 1024
    body.height = 1024
  }
  return body
}

function stripDataUrl(dataUrl: string): string {
  const idx = dataUrl.indexOf(',')
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
