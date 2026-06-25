const URL_PATTERN =
  /https?:\/\/(?:www\.)?(?:xiaohongshu\.com\/[A-Za-z0-9_./?=&%+-]+|xhslink\.com\/[A-Za-z0-9_./?=&%+-]+)/gi

export function extractXhsUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? []
  return [...new Set(matches.map((url) => url.replace(/[，。；;！!？?）】\]]+$/u, '')))]
}

export function isAllowedXhsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return (
      host === 'xiaohongshu.com' ||
      host.endsWith('.xiaohongshu.com') ||
      host === 'xhslink.com' ||
      host.endsWith('.xhslink.com')
    )
  } catch {
    return false
  }
}

export function isAllowedCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host.endsWith('.xhscdn.com') || host === 'xhscdn.com'
  } catch {
    return false
  }
}
