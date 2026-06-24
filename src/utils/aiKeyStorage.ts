const STORAGE_KEY = 'pindou.jimeng.apiKey'

export function getJimengApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function setJimengApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export function clearJimengApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasJimengApiKey(): boolean {
  return getJimengApiKey().length > 0
}

/** 图像生成大模型文档 */
export const JIMENG_VISUAL_DOC_URL = 'https://www.volcengine.com/docs/86081/1804465?lang=zh'

/** 开通服务说明 */
export const JIMENG_ACTIVATE_SERVICE_URL = 'https://www.volcengine.com/docs/86081/1660346?lang=zh'

/** IAM 权限配置（CVFullAccess） */
export const JIMENG_IAM_PERMISSION_URL = 'https://www.volcengine.com/docs/86081/1660350?lang=zh'

/** Ark API Key（火山方舟，另一条产品线） */
export const JIMENG_ARK_API_KEY_URL =
  'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey'

/** IAM AccessKey */
export const JIMENG_IAM_KEY_URL = 'https://console.volcengine.com/iam/keymanage'

/** @deprecated 使用 JIMENG_VISUAL_DOC_URL 或 JIMENG_ARK_API_KEY_URL */
export const JIMENG_CONSOLE_URL = JIMENG_VISUAL_DOC_URL
