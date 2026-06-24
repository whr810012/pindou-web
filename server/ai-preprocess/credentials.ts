export type JimengCredentials =
  | { type: 'bearer'; apiKey: string }
  | { type: 'aksk'; accessKeyId: string; secretAccessKey: string }

function normalizeCredentialText(input: string): string {
  return input.trim().replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
}

function normalizeBearerApiKey(key: string): string {
  return key
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/^Bearer\s+/i, '')
    .replace(/^(?:API\s*Key|api[_\s-]?key)\s*[:：]\s*/i, '')
    .trim()
}

function parseAccessKeyLines(text: string): { accessKeyId: string; secretAccessKey: string } | null {
  const normalized = text.replace(
    /(SecretAccessKey\s*[:：]\s*[^\s]+)(?=SecretAccessKey\s*[:：])/gi,
    '$1\n',
  )

  const accessKeyIds = [
    ...normalized.matchAll(/(?:AccessKeyId|access[_\s-]?key[_\s-]?id)\s*[:：]\s*(\S+)/gi),
  ].map((match) => match[1].trim())
  const secretAccessKeys = [
    ...normalized.matchAll(/(?:SecretAccessKey|secret[_\s-]?access[_\s-]?key)\s*[:：]\s*(\S+)/gi),
  ].map((match) => match[1].trim())

  if (!accessKeyIds.length || !secretAccessKeys.length) {
    return null
  }

  const accessKeyId =
    accessKeyIds.length === 1 ? accessKeyIds[0] : accessKeyIds[accessKeyIds.length - 1]
  const secretAccessKey =
    accessKeyIds.length === 1 ? secretAccessKeys[0] : secretAccessKeys[secretAccessKeys.length - 1]

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey }
  }
  return null
}

export function validateAkskCredentials(credentials: {
  accessKeyId: string
  secretAccessKey: string
}): string | null {
  if (/accesskeyid|secretaccesskey/i.test(credentials.secretAccessKey)) {
    return 'SecretAccessKey 格式异常：检测到多组密钥粘在一起。请先点「清除」，只粘贴一份 AccessKey.txt（仅两行）。'
  }
  if (!credentials.accessKeyId.startsWith('AKLT')) {
    return 'AccessKeyId 格式异常，应以 AKLT 开头'
  }
  return null
}

/**
 * 解析用户粘贴的凭证，支持：
 * - Ark API Key（单行 Bearer）
 * - ApiKey.txt 格式（API Key: ...）
 * - AccessKey.txt 格式（AccessKeyId / SecretAccessKey）
 * - AKLT...:Secret 单行
 */
export function parseJimengCredentials(input: string): JimengCredentials | null {
  const text = normalizeCredentialText(input)
  if (!text) return null

  const apiKeyMatch = text.match(/^(?:API\s*Key|api[_\s-]?key)\s*[:：]\s*(.+)$/is)
  if (apiKeyMatch?.[1]?.trim()) {
    return { type: 'bearer', apiKey: normalizeBearerApiKey(apiKeyMatch[1]) }
  }

  const fromLines = parseAccessKeyLines(text)
  if (fromLines) {
    return { type: 'aksk', ...fromLines }
  }

  const akMatch = text.match(/AccessKeyId\s*[:：]\s*(\S+)/i)
  const skMatches = [...text.matchAll(/SecretAccessKey\s*[:：]\s*(\S+)/gi)]
  if (akMatch && skMatches.length) {
    const secretAccessKey =
      skMatches.length === 1 ? skMatches[0][1] : skMatches[skMatches.length - 1][1]
    return {
      type: 'aksk',
      accessKeyId: akMatch[1],
      secretAccessKey,
    }
  }

  if (text.startsWith('AKLT') && text.includes(':') && !text.includes('\n')) {
    const colon = text.indexOf(':')
    const accessKeyId = text.slice(0, colon).trim()
    const secretAccessKey = text.slice(colon + 1).trim()
    if (accessKeyId && secretAccessKey) {
      return { type: 'aksk', accessKeyId, secretAccessKey }
    }
  }

  if (text.includes('\n') || /secretaccesskey/i.test(text)) {
    return null
  }

  return { type: 'bearer', apiKey: normalizeBearerApiKey(text) }
}

export function credentialsFromEnv(env: {
  accessKeyId?: string
  secretAccessKey?: string
  apiKey?: string
}): JimengCredentials | null {
  if (env.accessKeyId && env.secretAccessKey) {
    return {
      type: 'aksk',
      accessKeyId: env.accessKeyId.trim(),
      secretAccessKey: env.secretAccessKey.trim(),
    }
  }
  if (env.apiKey?.trim()) {
    const parsed = parseJimengCredentials(env.apiKey)
    return parsed ?? { type: 'bearer', apiKey: normalizeBearerApiKey(env.apiKey) }
  }
  return null
}

export function resolveJimengCredentials(
  apiKeyInput: string | undefined,
  env: {
    accessKeyId?: string
    secretAccessKey?: string
    apiKey?: string
  },
): JimengCredentials | null {
  const fromBody = apiKeyInput ? parseJimengCredentials(apiKeyInput) : null
  const fromEnv = credentialsFromEnv(env)

  if (fromBody) return fromBody
  return fromEnv
}
