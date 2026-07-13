import { runPipeline, prepareSourcePixels, type MappedGrid } from '@wangdandan810012/bead-core'
import { getPlatform } from '../platform/context.js'
import { usePaletteStore } from '../stores/palette.js'
import { useProjectStore } from '../stores/project.js'
import { buildSuggestedParams, buildSuggestedParamsForPrepImage, buildSuggestedParamsForFlatTile, type PrepImageMeta } from './suggestParams.js'

export async function processCurrentProject() {
  const project = useProjectStore()
  const paletteStore = usePaletteStore()
  await paletteStore.loadPalettes()

  if (!project.sourcePixels) {
    throw new Error('请先上传图片')
  }

  const rawPixels = project.sourcePixels!
  const pixels = project.params.flatTile
    ? rawPixels
    : prepareSourcePixels(
        rawPixels,
        project.sourceWidth,
        project.sourceHeight,
        project.params.imageAdjust,
        project.params.photoOptimize,
      )

  const result = runPipeline(
    pixels,
    project.sourceWidth,
    project.sourceHeight,
    {
      gridWidth: project.params.gridWidth,
      mode: project.params.mode,
      mergeThreshold: project.params.mergeThreshold,
      maxColors: project.params.maxColors,
      backgroundPaletteIds: paletteStore.backgroundIds,
      excludedPaletteIds: project.excludedPaletteIds,
      palette: paletteStore.activeEntries,
      flatTile: project.params.flatTile,
    },
  )

  project.setGrid(result.grid)
  return result.grid
}

export function pickImage(): Promise<string> {
  return getPlatform().imagePicker.pickImage()
}

export async function loadImageToProject(path: string) {
  const loaded = await getPlatform().imageLoader.loadFromPath(path)
  const project = useProjectStore()
  project.setSource(path, loaded.width, loaded.height, loaded.pixels)
  return loaded
}

/** 从预览图/路径恢复像素（打开已保存项目后调参用，不重置保存状态） */
export async function hydrateProjectSourceFromPath(path: string): Promise<boolean> {
  if (!path) return false
  try {
    const loaded = await getPlatform().imageLoader.loadFromPath(path)
    const project = useProjectStore()
    project.hydrateSourcePixels(loaded.width, loaded.height, loaded.pixels, path)
    return true
  } catch {
    return false
  }
}

/** 新图上传后根据尺寸与内容自动建议参数，并清除上一张图的排除色�?*/
export function applySuggestedParamsForImage(width: number, height: number, pixels: Uint8ClampedArray) {
  const project = useProjectStore()
  const maxGrid = getPlatform().getMaxGridWidth()
  project.restoreAllExcluded()
  project.setParams(buildSuggestedParams(width, height, pixels, maxGrid))
}

/** 拼豆专用图二次出图：格数按专用图生成时的像素尺寸自动设定 */
export function applySuggestedParamsForPrepImage(
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
  meta?: PrepImageMeta,
) {
  const project = useProjectStore()
  const maxGrid = getPlatform().getMaxGridWidth()
  project.restoreAllExcluded()
  project.setParams(buildSuggestedParamsForPrepImage(width, height, pixels, maxGrid, meta))
}

/** 原图平铺：格宽对齐图像宽度，不做预处理 */
export function applySuggestedParamsForFlatTile(width: number, height: number) {
  const project = useProjectStore()
  const maxGrid = getPlatform().getMaxGridWidth()
  project.restoreAllExcluded()
  project.setParams(buildSuggestedParamsForFlatTile(width, height, maxGrid))
}

export function replaceColorInGrid(
  grid: MappedGrid,
  fromId: string,
  toId: string,
  toHex: string,
): MappedGrid {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.isExternal || cell.paletteId !== fromId) return { ...cell }
      return { paletteId: toId, hex: toHex }
    }),
  )
}
