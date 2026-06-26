import { describe, expect, it, beforeEach } from 'vitest'
import { initPlatform } from '../platform/context.js'
import { DEFAULT_PARAMS } from '../types/app.js'
import { decodeParamPresetShare, encodeParamPresetShare } from './paramPresetShare.js'

function mockPlatform() {
  initPlatform({
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    navigation: { push: () => {}, replace: () => {}, back: () => {} },
    imagePicker: { pickImage: async () => '' },
    imageLoader: {
      loadFromPath: async () => ({ width: 1, height: 1, pixels: new Uint8ClampedArray(4) }),
    },
    codec: {
      toBase64: (s) => Buffer.from(s).toString('base64'),
      fromBase64: (s) => Buffer.from(s, 'base64').toString('utf8'),
    },
    http: { fetchJson: async <T>(_url: string) => ({}) as T },
    getMaxGridWidth: () => 120,
  })
}

describe('paramPresetShare', () => {
  beforeEach(() => mockPlatform())

  it('round-trips preset params', () => {
    const preset = {
      name: '测试预设',
      brand: 'MARD' as const,
      params: { ...DEFAULT_PARAMS, gridWidth: 64, maxColors: 12 },
    }
    const code = encodeParamPresetShare(preset)
    expect(code.startsWith('pindou-params-v1:')).toBe(true)
    const decoded = decodeParamPresetShare(code)
    expect(decoded.name).toBe('测试预设')
    expect(decoded.params.gridWidth).toBe(64)
    expect(decoded.params.maxColors).toBe(12)
  })

  it('rejects invalid share code', () => {
    expect(() => decodeParamPresetShare('invalid')).toThrow('无效的参数预设分享码')
  })
})
