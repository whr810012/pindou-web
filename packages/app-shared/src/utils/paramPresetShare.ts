import { getPlatform } from '../platform/context.js'
import type { ParamPreset } from '../types/app.js'
import { DEFAULT_PARAMS } from '../types/app.js'
import { createParamPresetId } from './paramPresetsStorage.js'

const SHARE_PREFIX = 'pindou-params-v1:'

interface SharePayload {
  v: 1
  name: string
  params: ParamPreset['params']
  brand: ParamPreset['brand']
}

export function encodeParamPresetShare(preset: Pick<ParamPreset, 'name' | 'params' | 'brand'>): string {
  const payload: SharePayload = {
    v: 1,
    name: preset.name,
    params: preset.params,
    brand: preset.brand,
  }
  return SHARE_PREFIX + getPlatform().codec.toBase64(JSON.stringify(payload))
}

export function decodeParamPresetShare(text: string): ParamPreset {
  const raw = text.trim()
  if (!raw.startsWith(SHARE_PREFIX)) {
    throw new Error('无效的参数预设分享码')
  }
  const payload = JSON.parse(
    getPlatform().codec.fromBase64(raw.slice(SHARE_PREFIX.length)),
  ) as SharePayload
  if (payload.v !== 1 || !payload.params) {
    throw new Error('无效的参数预设分享码')
  }
  return {
    id: createParamPresetId(),
    name: payload.name || '导入预设',
    brand: payload.brand ?? DEFAULT_PARAMS.brand,
    params: {
      ...DEFAULT_PARAMS,
      ...payload.params,
      imageAdjust: { ...DEFAULT_PARAMS.imageAdjust, ...payload.params.imageAdjust },
      photoOptimize: { ...DEFAULT_PARAMS.photoOptimize, ...payload.params.photoOptimize },
    },
    updatedAt: Date.now(),
  }
}
