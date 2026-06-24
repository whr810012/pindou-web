import { describe, expect, it } from 'vitest'
import { estimateBase64Bytes, handleAiPreprocess } from './handler'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('handleAiPreprocess', () => {
  it('rejects missing image', async () => {
    const result = await handleAiPreprocess({ image: '', style: 'cartoon' })
    expect(result.status).toBe(400)
    expect(result.body.error).toContain('image')
  })

  it('rejects missing api key', async () => {
    const result = await handleAiPreprocess({ image: TINY_PNG, style: 'cartoon' })
    expect(result.status).toBe(400)
    expect(result.body.error).toContain('凭证')
  })

  it('mock passthrough with apiKey mock', async () => {
    const result = await handleAiPreprocess({
      image: TINY_PNG,
      style: 'flat',
      apiKey: 'mock',
    })
    expect(result.status).toBe(200)
    expect(result.body.image).toBe(TINY_PNG)
    expect(result.body.mock).toBe(true)
  })

  it('estimates base64 size', () => {
    expect(estimateBase64Bytes(TINY_PNG)).toBeGreaterThan(0)
    expect(estimateBase64Bytes(TINY_PNG)).toBeLessThan(200)
  })
})
