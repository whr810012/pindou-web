import type { MappedGrid } from '@pindou/bead-core'
import { getPlatform } from '../platform/context.js'
import type { ProjectParams } from '../types/app.js'

const SHARE_PREFIX = 'pindou-project-v1:'

export interface ProjectSharePayload {
  version: 1
  name: string
  params: ProjectParams
  grid: MappedGrid
  excludedPaletteIds: string[]
  completedCells: string[]
}

export function encodeProjectShare(
  payload: Omit<ProjectSharePayload, 'version'>,
): string {
  const data: ProjectSharePayload = { version: 1, ...payload }
  return SHARE_PREFIX + getPlatform().codec.toBase64(JSON.stringify(data))
}

export function decodeProjectShare(text: string): ProjectSharePayload {
  const raw = text.trim()
  if (!raw.startsWith(SHARE_PREFIX)) {
    throw new Error('无效的项目分享码')
  }
  const data = JSON.parse(
    getPlatform().codec.fromBase64(raw.slice(SHARE_PREFIX.length)),
  ) as ProjectSharePayload
  if (data.version !== 1 || !data.grid?.length) {
    throw new Error('无效的项目分享码')
  }
  return data
}
