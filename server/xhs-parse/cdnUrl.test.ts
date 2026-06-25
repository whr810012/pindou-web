import { describe, expect, it } from 'vitest'
import { buildCdnUrl, buildImageFetchCandidates, collectImageUrlsFromHtml, normalizeXhsImageUrl } from './cdnUrl.js'

describe('buildCdnUrl', () => {
  it('builds webp preview url with width', () => {
    const url = buildCdnUrl('https://sns-img-hw.xhscdn.com/abc/photo.jpg', 720)
    expect(url).toBe(
      'https://sns-img-hw.xhscdn.com/abc/photo.jpg?imageView2/2/w/720/format/webp',
    )
  })

  it('rejects non-cdn host', () => {
    expect(() => buildCdnUrl('https://evil.com/a.jpg')).toThrow('不允许的 CDN 域名')
  })
})

describe('normalizeXhsImageUrl', () => {
  it('keeps original host and path', () => {
    const url = normalizeXhsImageUrl('https://sns-img-qc.xhscdn.com/abc/def.jpg')
    expect(url).toBe('https://sns-img-qc.xhscdn.com/abc/def.jpg')
  })
})

describe('buildImageFetchCandidates', () => {
  it('includes original and imageView2 variants', () => {
    const list = buildImageFetchCandidates('https://sns-img-qc.xhscdn.com/notes/a.jpg?sign=xyz')
    expect(list[0]).toContain('sign=xyz')
    expect(list.some((u) => u.includes('imageView2'))).toBe(true)
    expect(list.some((u) => u.includes('sns-img-hw.xhscdn.com'))).toBe(true)
  })

  it('keeps sns-webpic url without imageView2 mangling', () => {
    const raw =
      'http://sns-webpic-qc.xhscdn.com/202606251639/abc/file!nd_dft_wgth_jpg_3'
    const list = buildImageFetchCandidates(raw)
    expect(list[0]).toBe(raw)
    expect(list.every((u) => u.includes('!nd_dft'))).toBe(true)
    expect(list.some((u) => u.includes('imageView2'))).toBe(false)
  })
})

describe('collectImageUrlsFromHtml', () => {
  it('extracts sns-webpic note images from initial state snippet', () => {
    const html = `
      window.__INITIAL_STATE__={"note":{"noteDetailMap":{"id1":{"note":{
        "imageList":[{"urlDefault":"http://sns-webpic-qc.xhscdn.com/202606251639/abc/file!nd_dft_wgth_jpg_3",
        "infoList":[{"imageScene":"WB_DFT","url":"http://sns-webpic-qc.xhscdn.com/202606251639/abc/file!nd_dft_wgth_jpg_3"}]}]
      }}}}}
    `
    const urls = collectImageUrlsFromHtml(html)
    expect(urls.some((u) => u.includes('sns-webpic') && u.includes('nd_dft'))).toBe(true)
    expect(urls.some((u) => u.includes('fe-platform'))).toBe(false)
  })
})
