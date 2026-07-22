import { assetUrl } from '@/utils/assetUrl'

const DEV_XHS_URL = 'http://127.0.0.1:8788/api/xhs-parse'

const ENDPOINT =
  import.meta.env.VITE_XHS_PARSE_URL ||
  (import.meta.env.PROD ? assetUrl('/api/xhs-parse') : DEV_XHS_URL)

export const XHS_IMPORT_ENABLED = Boolean(ENDPOINT)

export interface XhsParseImage {
  id: string
  preview: string
  dataUrl: string
}

export async function parseXhsShareText(text: string): Promise<XhsParseImage[]> {
  if (!ENDPOINT) {
    throw new Error('小红书解析未配置，请设置 VITE_XHS_PARSE_URL')
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  const data = (await response.json()) as {
    images?: XhsParseImage[]
    error?: string
    mock?: boolean
  }

  if (!response.ok) {
    throw new Error(data.error || `解析服务错误 ${response.status}`)
  }

  if (data.error) {
    throw new Error(data.error)
  }

  if (!data.images?.length) {
    throw new Error('未解析到图片，请手动保存图片后上传')
  }

  return data.images
}
