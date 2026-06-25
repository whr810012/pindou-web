import { getPlatform } from '../platform/context.js'
import type { SavedProject } from '../types/app.js'

const STORAGE_KEY = 'pindou_projects_v1'
const MAX_PREVIEW_CHARS = 48_000

function readAll(): SavedProject[] {
  try {
    const raw = getPlatform().storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(projects: SavedProject[]) {
  getPlatform().storage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

function cloneGrid<T>(grid: T): T {
  return JSON.parse(JSON.stringify(grid)) as T
}

/** 压缩可选字段，避免 localStorage 配额溢出 */
export function normalizeSavedProject(project: SavedProject): SavedProject {
  const thumbnail =
    project.thumbnail && project.thumbnail.length <= MAX_PREVIEW_CHARS
      ? project.thumbnail
      : undefined
  const sourcePreview =
    project.sourcePreview && project.sourcePreview.length <= MAX_PREVIEW_CHARS
      ? project.sourcePreview
      : undefined

  return {
    ...project,
    grid: cloneGrid(project.grid),
    excludedPaletteIds: [...project.excludedPaletteIds],
    completedCells: [...(project.completedCells ?? [])],
    thumbnail,
    sourcePreview,
  }
}

function tryWrite(project: SavedProject) {
  const all = readAll()
  const index = all.findIndex((p) => p.id === project.id)
  if (index >= 0) all[index] = project
  else all.unshift(project)
  writeAll(all)
}

export const ProjectStorage = {
  list(): SavedProject[] {
    return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
  },

  save(project: SavedProject) {
    const normalized = normalizeSavedProject(project)

    try {
      tryWrite(normalized)
      return
    } catch {
      // 配额不足时再去掉预览图重试
    }

    try {
      tryWrite({
        ...normalized,
        thumbnail: undefined,
        sourcePreview: undefined,
      })
      return
    } catch (error) {
      const message =
        error instanceof Error && /quota|exceeded/i.test(error.message)
          ? '浏览器存储空间不足，请删除部分旧项目或导出文件后重试'
          : '保存失败，请稍后重试'
      throw new Error(message)
    }
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
      grid: cloneGrid(source.grid),
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
