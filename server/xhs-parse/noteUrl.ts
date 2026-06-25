/** 从笔记链接提取 noteId（discovery/item 或 explore） */
export function extractNoteIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/(?:discovery\/item|explore)\/([a-f0-9]+)/i)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/** 保留 xsec_token 等鉴权参数，生成 explore 页 URL */
export function buildExploreUrl(noteId: string, sourceUrl: string): string {
  const src = new URL(sourceUrl)
  const out = new URL(`https://www.xiaohongshu.com/explore/${noteId}`)
  for (const key of ['xsec_token', 'xsec_source', 'source']) {
    const value = src.searchParams.get(key)
    if (value) out.searchParams.set(key, value)
  }
  return out.href
}

/** 生成 discovery/item 页 URL（部分分享链走此路径） */
export function buildDiscoveryUrl(noteId: string, sourceUrl: string): string {
  const src = new URL(sourceUrl)
  const out = new URL(`https://www.xiaohongshu.com/discovery/item/${noteId}`)
  for (const key of ['xsec_token', 'xsec_source', 'source', 'xhsshare']) {
    const value = src.searchParams.get(key)
    if (value) out.searchParams.set(key, value)
  }
  return out.href
}

/** 按优先级去重后的抓取候选 URL */
export function buildFetchCandidates(rawUrl: string): string[] {
  const seen = new Set<string>()
  const list: string[] = []

  const add = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    list.push(url)
  }

  add(rawUrl)

  const noteId = extractNoteIdFromUrl(rawUrl)
  if (noteId) {
    add(buildExploreUrl(noteId, rawUrl))
    add(buildDiscoveryUrl(noteId, rawUrl))
  }

  return list
}
