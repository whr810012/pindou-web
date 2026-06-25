import { describe, expect, it, vi } from 'vitest'
import { proxyImageToDataUrl } from './proxyImage.js'

describe('proxyImageToDataUrl', () => {
  it('retries alternate cdn urls after first failure', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('sns-img-qc')) {
        return new Response('not found', { status: 404 })
      }
      return new Response(Buffer.alloc(256, 0xff), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    })

    const result = await proxyImageToDataUrl(
      'img-1',
      'https://sns-img-qc.xhscdn.com/notes/test.jpg',
      { fetchImpl: fetchImpl as unknown as typeof fetch },
    )

    expect(result.dataUrl).toContain('data:image/jpeg')
    expect(fetchImpl.mock.calls.length).toBeGreaterThan(1)
  })
})
