import { getPlatform } from '../platform/context.js'
import type { SavedProject } from '../types/app.js'

const STORAGE_KEY = 'pindou_projects_v1'

function readAll(): SavedProject[] {
  try {
    const raw = getPlatform().storage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedProject[]
  } catch {
    return []
  }
}

function writeAll(projects: SavedProject[]) {
  getPlatform().storage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const ProjectStorage = {
  list(): SavedProject[] {
    return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
  },

  save(project: SavedProject) {
    const all = readAll()
    const index = all.findIndex((p) => p.id === project.id)
    if (index >= 0) all[index] = project
    else all.unshift(project)
    writeAll(all)
  },

  get(id: string): SavedProject | undefined {
    return readAll().find((p) => p.id === id)
  },

  remove(id: string) {
    writeAll(readAll().filter((p) => p.id !== id))
  },

  duplicate(id: string): SavedProject | undefined {
    const source = readAll().find((p) => p.id === id)
    if (!source) return undefined
    const copy: SavedProject = {
      ...source,
      id: createProjectId(),
      name: `${source.name} 副本`,
      updatedAt: Date.now(),
      grid: JSON.parse(JSON.stringify(source.grid)),
      excludedPaletteIds: [...source.excludedPaletteIds],
      completedCells: [...(source.completedCells ?? [])],
    }
    this.save(copy)
    return copy
  },

  rename(id: string, name: string) {
    const item = readAll().find((p) => p.id === id)
    if (!item) return
    item.name = name
    item.updatedAt = Date.now()
    this.save(item)
  },
}

export function createProjectId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
