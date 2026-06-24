import { runPipeline, type MappedGrid } from '@pindou/bead-core'
import { getPlatform } from '../platform/context.js'
import { usePaletteStore } from '../stores/palette.js'
import { useProjectStore } from '../stores/project.js'
import { suggestGridWidth, suggestModeForImage } from './suggestParams.js'

export async function processCurrentProject() {
  const project = useProjectStore()
  const paletteStore = usePaletteStore()
  await paletteStore.loadPalettes()

  if (!project.sourcePixels) {
    throw new Error('请先上传图片')
  }

  const result = runPipeline(
    project.sourcePixels,
    project.sourceWidth,
    project.sourceHeight,
    {
      gridWidth: project.params.gridWidth,
      mode: project.params.mode,
      mergeThreshold: project.params.mergeThreshold,
      backgroundPaletteIds: paletteStore.backgroundIds,
      excludedPaletteIds: project.excludedPaletteIds,
      palette: paletteStore.activeEntries,
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

/** 新图上传后根据尺寸与内容自动建议参数 */
export function applySuggestedParamsForImage(width: number, height: number, pixels: Uint8ClampedArray) {
  const project = useProjectStore()
  const maxGrid = getPlatform().getMaxGridWidth()
  project.setParams({
    gridWidth: suggestGridWidth(width, height, maxGrid),
    mode: suggestModeForImage(pixels, width, height),
    mergeThreshold: 8,
    palettePresetId: 'pindou-full',
  })
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
