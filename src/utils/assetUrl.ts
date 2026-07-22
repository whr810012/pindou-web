const BASE_URL = import.meta.env.BASE_URL

export function assetUrl(path: string): string {
  if (/^(?:[a-z]+:|\/\/|data:|blob:)/i.test(path)) return path
  if (path.startsWith(BASE_URL)) return path
  return `${BASE_URL}${path.replace(/^\/+/, '')}`
}
