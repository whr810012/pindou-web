export { initPlatform, getPlatform } from './platform/context.js'
export type {
  StoragePort,
  NavigationPort,
  ImagePickerPort,
  ImageLoaderPort,
  LoadedImage,
  CodecPort,
  HttpPort,
  PlatformPorts,
} from './platform/types.js'

export * from './types/app.js'

export { useProjectStore } from './stores/project.js'
export { usePaletteStore } from './stores/palette.js'
export { useEditorStore } from './stores/editor.js'
export { useFocusStore } from './stores/focus.js'

export { ProjectStorage, createProjectId } from './utils/projectStorage.js'
export {
  loadCustomPalettes,
  saveCustomPalettes,
  createCustomPaletteId,
  createCustomEntryId,
  parsePaletteImport,
  exportPaletteJson,
  exportPaletteCsv,
} from './utils/customPaletteStorage.js'
export { loadParamPresets, saveParamPresets, createParamPresetId } from './utils/paramPresetsStorage.js'
export { encodeParamPresetShare, decodeParamPresetShare } from './utils/paramPresetShare.js'
export { debounce } from './utils/debounce.js'
export * from './utils/cropMath.js'
export * from './utils/suggestParams.js'
export * from './utils/focusZones.js'
export * from './utils/paletteShare.js'
export { encodeProjectShare, decodeProjectShare } from './utils/projectShare.js'
export type { ProjectSharePayload } from './utils/projectShare.js'
export {
  processCurrentProject,
  pickImage,
  loadImageToProject,
  hydrateProjectSourceFromPath,
  applySuggestedParamsForImage,
  replaceColorInGrid,
} from './utils/pipeline.js'
export {
  resolveBackgroundPaletteIds,
  resolveEraserEntry,
  eraserDisplayCode,
  normalizePaletteHex,
} from './utils/backgroundPalette.js'
