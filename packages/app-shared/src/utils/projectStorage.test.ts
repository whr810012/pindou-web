import { describe, expect, it, beforeEach } from 'vitest'
import { initPlatform } from '../platform/context.js'
import { normalizeSavedProject, ProjectStorage, createProjectId } from './projectStorage.js'
import type { SavedProject } from '../types/app.js'

function mockPlatform() {
  const store = new Map<string, string>()
  initPlatform({
    storage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value)
      },
      removeItem: (key) => {
        store.delete(key)
      },
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
    http: { fetchJson: async () => ({}) },
    getMaxGridWidth: () => 120,
  })
  return store
}

function sampleProject(id: string): SavedProject {
  return {
    id,
    name: '测试',
    updatedAt: Date.now(),
    params: {
      gridWidth: 4,
      mode: 'average',
      mergeThreshold: 0,
      maxColors: 0,
      palettePresetId: 'pindou-96',
      brand: 'MARD',
      imageAdjust: { brightness: 0, contrast: 0, saturation: 0 },
      photoOptimize: { denoise: 0, sharpen: 0 },
    },
    grid: [
      [
        { paletteId: 'a', hex: '#000000', isExternal: false },
        { paletteId: 'b', hex: '#ffffff', isExternal: false },
      ],
    ],
    excludedPaletteIds: [],
    completedCells: [],
  }
}

describe('ProjectStorage', () => {
  beforeEach(() => {
    mockPlatform()
  })

  it('saves and lists projects', () => {
    const id = createProjectId()
    ProjectStorage.save(sampleProject(id))
    const list = ProjectStorage.list()
    expect(list).toHaveLength(1)
    expect(list[0]?.id).toBe(id)
  })

  it('strips oversized previews', () => {
    const project = sampleProject('p1')
    project.sourcePreview = 'x'.repeat(60_000)
    const normalized = normalizeSavedProject(project)
    expect(normalized.sourcePreview).toBeUndefined()
  })
})
