import { describe, expect, it } from 'vitest'
import { collectImageUrlsFromHtml, normalizeXhsImageUrl } from './cdnUrl.js'
import { extractXhsUrls, isAllowedCdnUrl, isAllowedXhsUrl } from './extractUrl.js'

describe('extractXhsUrls', () => {
  it('extracts xhslink from share text', () => {
    const text = '99 看看【小红书】 http://xhslink.com/a/AbCdE ，复制后打开'
    expect(extractXhsUrls(text)).toEqual(['http://xhslink.com/a/AbCdE'])
  })

  it('extracts xiaohongshu explore url', () => {
    const text = 'https://www.xiaohongshu.com/explore/abc123'
    expect(extractXhsUrls(text)).toEqual(['https://www.xiaohongshu.com/explore/abc123'])
  })

  it('extracts discovery/item url with query params', () => {
    const text =
      'https://www.xiaohongshu.com/discovery/item/6a362d610000000011010a42?xsec_token=abc&xsec_source=pc_share'
    expect(extractXhsUrls(text)[0]).toContain('/discovery/item/6a362d610000000011010a42')
    expect(extractXhsUrls(text)[0]).toContain('xsec_token=abc')
  })

  it('deduplicates multiple links', () => {
    const text =
      'http://xhslink.com/a/1 http://xhslink.com/a/1 https://www.xiaohongshu.com/explore/x'
    expect(extractXhsUrls(text)).toHaveLength(2)
  })
})

describe('isAllowedXhsUrl', () => {
  it('allows xhs domains', () => {
    expect(isAllowedXhsUrl('https://xhslink.com/a/x')).toBe(true)
    expect(isAllowedXhsUrl('https://www.xiaohongshu.com/explore/1')).toBe(true)
  })

  it('rejects other domains', () => {
    expect(isAllowedXhsUrl('https://evil.com/x')).toBe(false)
  })
})

describe('isAllowedCdnUrl', () => {
  it('allows xhscdn hosts', () => {
    expect(isAllowedCdnUrl('https://sns-img-hw.xhscdn.com/foo.jpg')).toBe(true)
  })
})

describe('normalizeXhsImageUrl', () => {
  it('preserves qc host url', () => {
    const url = normalizeXhsImageUrl('https://sns-img-qc.xhscdn.com/abc/def.jpg')
    expect(url).toContain('sns-img-qc.xhscdn.com')
    expect(url).toContain('abc/def.jpg')
  })
})

describe('collectImageUrlsFromHtml', () => {
  it('finds xhscdn urls in html', () => {
    const html = '<img src="https://sns-img-qc.xhscdn.com/note/1.jpg" />'
    const urls = collectImageUrlsFromHtml(html)
    expect(urls.length).toBeGreaterThan(0)
    expect(urls[0]).toContain('xhscdn.com')
  })

  it('parses nested __INITIAL_STATE__ json', () => {
    const html = `
      <script>
        window.__INITIAL_STATE__={"note":{"imageList":[{"url":"https://sns-img-qc.xhscdn.com/notes/abc/photo.jpg"}]}}
      </script>
    `
    const urls = collectImageUrlsFromHtml(html)
    expect(urls.length).toBeGreaterThan(0)
    expect(urls[0]).toContain('notes/abc/photo.jpg')
  })

  it('decodes escaped unicode cdn urls', () => {
    const html =
      '"url":"https:\\/\\/sns-img-qc.xhscdn.com\\/notes\\/x\\/1.jpg"'
    const urls = collectImageUrlsFromHtml(html)
    expect(urls.length).toBeGreaterThan(0)
  })

  it('skips avatar urls', () => {
    const html = `
      https://sns-avatar-qc.xhscdn.com/avatar/1.jpg
      https://sns-img-qc.xhscdn.com/notes/real/2.jpg
    `
    const urls = collectImageUrlsFromHtml(html)
    expect(urls.some((u) => u.includes('avatar'))).toBe(false)
    expect(urls.some((u) => u.includes('notes/real'))).toBe(true)
  })
})
