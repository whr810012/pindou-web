import { getPlatform } from '../platform/context.js'
import type { ParamPreset } from '../types/app.js'

const STORAGE_KEY = 'pindou-param-presets'

export function loadParamPresets(): ParamPreset[] {
  try {
    const raw = getPlatform().storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveParamPresets(presets: ParamPreset[]) {
  getPlatform().storage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function createParamPresetId(): string {
  return `preset-${Date.now().toString(36)}`
}
