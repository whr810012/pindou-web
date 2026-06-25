import { describe, expect, it } from 'vitest'
import {
  buildDiscoveryUrl,
  buildExploreUrl,
  buildFetchCandidates,
  extractNoteIdFromUrl,
} from './noteUrl.js'

const SAMPLE =
  'https://www.xiaohongshu.com/discovery/item/6a362d610000000011010a42?source=webshare&xhsshare=pc_web&xsec_token=ABAai-test&xsec_source=pc_share'

describe('extractNoteIdFromUrl', () => {
  it('extracts id from discovery/item url', () => {
    expect(extractNoteIdFromUrl(SAMPLE)).toBe('6a362d610000000011010a42')
  })

  it('extracts id from explore url', () => {
    expect(extractNoteIdFromUrl('https://www.xiaohongshu.com/explore/abc123def')).toBe(
      'abc123def',
    )
  })
})

describe('buildExploreUrl', () => {
  it('preserves xsec_token', () => {
    const url = buildExploreUrl('6a362d610000000011010a42', SAMPLE)
    expect(url).toContain('/explore/6a362d610000000011010a42')
    expect(url).toContain('xsec_token=ABAai-test')
    expect(url).toContain('xsec_source=pc_share')
  })
})

describe('buildDiscoveryUrl', () => {
  it('preserves share params', () => {
    const url = buildDiscoveryUrl('6a362d610000000011010a42', SAMPLE)
    expect(url).toContain('/discovery/item/')
    expect(url).toContain('xhsshare=pc_web')
  })
})

describe('buildFetchCandidates', () => {
  it('returns original plus explore and discovery variants', () => {
    const list = buildFetchCandidates(SAMPLE)
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]).toBe(SAMPLE)
    expect(list.some((u) => u.includes('/explore/'))).toBe(true)
    expect(list.some((u) => u.includes('/discovery/item/'))).toBe(true)
  })
})
