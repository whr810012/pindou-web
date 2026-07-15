import { BEAD_CORE_INSTALL_CMD, BEAD_CORE_NPM_PACKAGE } from './beadCore'

export const BEAD_CORE_DOCS_TOC = [
  { id: 'install', label: '安装' },
  { id: 'concepts', label: '核心概念' },
  { id: 'quickstart', label: '快速开始' },
  { id: 'load-image', label: '读取图片' },
  { id: 'pipeline', label: 'Pipeline 参数' },
  { id: 'stepwise', label: '分步调用' },
  { id: 'preprocess', label: '图像预处理' },
  { id: 'prep', label: '拼豆 Prep' },
  { id: 'edit', label: '编辑与统计' },
  { id: 'api', label: 'API 一览' },
  { id: 'relation', label: '与网页关系' },
  { id: 'faq', label: 'FAQ' },
] as const

export const BEAD_CORE_HIGHLIGHTS = [
  { label: '零运行时依赖', desc: '不绑定 Vue / Canvas，Node 与浏览器均可使用' },
  { label: 'CIEDE2000 配色', desc: '感知色差 ΔE，与主流拼豆工具一致的色板匹配' },
  { label: '照片清晰度优化', desc: '可调预处理 + 合并阈值，保留边缘细节' },
  { label: '完整流水线', desc: '转换 → 合并 → 限色 → 背景标记 → 排除色重映射' },
] as const

export const BEAD_CORE_PIPELINE_ASCII = `prepareSourcePixels（可选）
       ↓
runPipeline
  ├─ convertImageToPattern（降采样 + CIEDE2000 配色）
  ├─ mergeSimilarRegions（flatTile 时跳过）
  ├─ limitGridColors
  ├─ markExternalBackground
  └─ remapExcludedColors`

export const BEAD_CORE_PIPELINE_PARAMS = [
  { name: 'gridWidth', type: 'number', desc: '输出网格列数；行数按原图比例自动计算' },
  { name: 'mode', type: "'average' | 'dominant'", desc: '照片用 average；卡通/像素风用 dominant' },
  { name: 'mergeThreshold', type: 'number', desc: '相似色合并阈值；0 关闭' },
  { name: 'maxColors', type: 'number', desc: '最大颜色数；0 不限' },
  { name: 'palette', type: 'PaletteEntry[]', desc: '调用方传入的色板，不能为空' },
  { name: 'backgroundPaletteIds', type: 'string[]', desc: '四边洪泛标记为 isExternal' },
  { name: 'excludedPaletteIds', type: 'string[]', desc: '排除色号，重映射到最近色' },
  { name: 'flatTile', type: 'boolean?', desc: '适合 prep 结果：一像素一豆，跳过合并' },
] as const

export const BEAD_CORE_API_ROWS = [
  { category: '流水线', name: 'runPipeline', desc: '完整生成流程' },
  { category: '转换', name: 'convertImageToPattern', desc: '图片 → 拼豆网格' },
  { category: '转换', name: 'mapImageToGrid', desc: 'convertImageToPattern 别名' },
  { category: '预处理', name: 'prepareSourcePixels', desc: '亮度 / 对比度 / 饱和度 / 锐化 / 降噪' },
  { category: '预处理', name: 'DEFAULT_IMAGE_ADJUST', desc: '默认图像调节' },
  { category: 'Prep', name: 'createBeadPrepPixels', desc: '拼豆专用中间图' },
  { category: 'Prep', name: 'createPixelArtPrepPixels', desc: '像素风中间图' },
  { category: '合并', name: 'mergeSimilarRegions', desc: '相似色区域合并' },
  { category: '背景', name: 'markExternalBackground', desc: '贴边背景洪水填充' },
  { category: '限色', name: 'limitGridColors', desc: '限制最大颜色数' },
  { category: '重映射', name: 'remapExcludedColors', desc: '排除色重映射' },
  { category: '编辑', name: 'fillRegion', desc: '油漆桶填充同色区域' },
  { category: '编辑', name: 'paintRect', desc: '矩形上色' },
  { category: '编辑', name: 'trimGrid / flip*', desc: '裁边与翻转' },
  { category: '统计', name: 'computeColorStats', desc: '色号用量统计' },
  { category: '色彩', name: 'colorDistance', desc: 'CIEDE2000 色差' },
  { category: '色彩', name: 'findClosestPaletteEntry', desc: '最近色板匹配' },
] as const

export const BEAD_CORE_FAQS = [
  {
    q: 'bead-core 适合什么场景？',
    a: '适合需要把图片转成拼豆色号网格的 Web、小程序、Node 批处理项目。库本身不包含 UI 与内置色板。',
  },
  {
    q: 'Pindou 网页和 bead-core 是什么关系？',
    a: '网页端使用同一套核心算法完成上传、生成、精修与导出；色板与项目存储在应用层，算法库独立发布便于集成。',
  },
  {
    q: '如何安装？',
    a: `执行 ${BEAD_CORE_INSTALL_CMD}。本包为 ESM，Node ≥ 18。`,
  },
  {
    q: '有没有内置色板？',
    a: '没有。请传入自有 PaletteEntry[]（含 id、hex、各品牌 codes）。',
  },
  {
    q: '算法细节在哪看？',
    a: 'GitHub 仓库 docs/algorithms/ 目录有逐算法说明；本页聚焦如何调用。',
  },
  {
    q: '许可证是什么？',
    a: 'MIT，Copyright © 蛋蛋。',
  },
] as const

export const BEAD_CORE_RELATED_LINKS = [
  { label: '免费在线工作台', path: '/workspace' },
  { label: '拼豆新手教程', path: '/guide' },
  { label: '案例画廊', path: '/gallery' },
] as const

/** 可跟做的端到端示例（含迷你色板，无未定义变量） */
export const BEAD_CORE_CODE_QUICKSTART = `import {
  prepareSourcePixels,
  runPipeline,
  computeColorStats,
  countTotalBeads,
  trimGrid,
  type PaletteEntry,
  type BrandSystem,
} from '${BEAD_CORE_NPM_PACKAGE}'

const palette: PaletteEntry[] = [
  {
    id: 'red-01',
    hex: '#E74C3C',
    codes: { MARD: 'A1', COCO: 'A1', MANMAN: 'A1', PANPAN: 'A1', MIXIAOWO: 'A1' },
  },
  {
    id: 'neutral-001',
    hex: '#FFFFFF',
    codes: { MARD: 'H1', COCO: 'H1', MANMAN: 'H1', PANPAN: 'H1', MIXIAOWO: 'H1' },
  },
]

// 2×2 示例像素；实际项目用 Canvas / sharp 读图
const width = 2
const height = 2
const pixels = new Uint8ClampedArray([
  231, 76, 60, 255, 231, 76, 60, 255,
  231, 76, 60, 255, 231, 76, 60, 255,
])

const adjusted = prepareSourcePixels(
  pixels, width, height,
  { brightness: 0, contrast: 12, saturation: 0 },
  { denoise: false, sharpen: true },
)

const { grid, width: gridW, height: gridH } = runPipeline(adjusted, width, height, {
  gridWidth: 2,
  mode: 'average',
  mergeThreshold: 0,
  maxColors: 0,
  palette,
  backgroundPaletteIds: ['neutral-001'],
  excludedPaletteIds: [],
})

const trimmed = trimGrid(grid)
const brand: BrandSystem = 'MARD'
const stats = computeColorStats(trimmed, brand, (id, b) =>
  palette.find((p) => p.id === id)?.codes[b] ?? id,
)

console.log(\`网格 \${gridW}×\${gridH}，共 \${countTotalBeads(trimmed)} 颗豆\`, stats)`

export const BEAD_CORE_CODE_PALETTE = `import type { PaletteEntry } from '${BEAD_CORE_NPM_PACKAGE}'

const palette: PaletteEntry[] = [
  {
    id: 'red-01',
    hex: '#E74C3C',
    codes: { MARD: 'A1', COCO: 'A1', MANMAN: 'A1', PANPAN: 'A1', MIXIAOWO: 'A1' },
  },
  {
    id: 'neutral-001',
    hex: '#FFFFFF',
    codes: { MARD: 'H1', COCO: 'H1', MANMAN: 'H1', PANPAN: 'H1', MIXIAOWO: 'H1' },
  },
]`

export const BEAD_CORE_CODE_BROWSER = `import { runPipeline, type PaletteEntry } from '${BEAD_CORE_NPM_PACKAGE}'

async function imageToGrid(imageUrl: string, palette: PaletteEntry[]) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageUrl
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  return runPipeline(data, width, height, {
    gridWidth: 64,
    mode: 'average',
    mergeThreshold: 0,
    maxColors: 0,
    palette,
    backgroundPaletteIds: [],
    excludedPaletteIds: [],
  })
}`

export const BEAD_CORE_CODE_NODE = `import sharp from 'sharp'
import { runPipeline, type PaletteEntry } from '${BEAD_CORE_NPM_PACKAGE}'

async function fileToGrid(filePath: string, palette: PaletteEntry[]) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return runPipeline(new Uint8ClampedArray(data), info.width, info.height, {
    gridWidth: 64,
    mode: 'average',
    mergeThreshold: 0,
    maxColors: 0,
    palette,
    backgroundPaletteIds: [],
    excludedPaletteIds: [],
  })
}`

export const BEAD_CORE_CODE_STEPWISE = `import {
  convertImageToPattern,
  mergeSimilarRegions,
  limitGridColors,
  markExternalBackground,
  remapExcludedColors,
} from '${BEAD_CORE_NPM_PACKAGE}'

let grid = convertImageToPattern(pixels, width, height, {
  gridWidth: 64,
  mode: 'dominant',
  palette,
  excludedPaletteIds: [],
  despeckle: false,
})

grid = mergeSimilarRegions(grid, 5)
grid = limitGridColors(grid, palette, 20)
grid = markExternalBackground(grid, ['neutral-001'])
grid = remapExcludedColors(grid, palette, ['old-color-id'])`

export const BEAD_CORE_CODE_PREPROCESS = `import {
  prepareSourcePixels,
  DEFAULT_IMAGE_ADJUST,
  DEFAULT_PHOTO_OPTIMIZE,
} from '${BEAD_CORE_NPM_PACKAGE}'

const adjusted = prepareSourcePixels(
  pixels,
  width,
  height,
  { ...DEFAULT_IMAGE_ADJUST, contrast: 12 },
  { ...DEFAULT_PHOTO_OPTIMIZE, sharpen: true },
)`

export const BEAD_CORE_CODE_PREP = `import {
  createBeadPrepPixels,
  createPixelArtPrepPixels,
  runPipeline,
} from '${BEAD_CORE_NPM_PACKAGE}'

const prep = createBeadPrepPixels(pixels, width, height, 80)

const { grid } = runPipeline(prep.pixels, prep.width, prep.height, {
  gridWidth: prep.gridWidth,
  mode: 'dominant',
  mergeThreshold: 0,
  maxColors: 0,
  palette,
  backgroundPaletteIds: [],
  excludedPaletteIds: [],
  flatTile: true, // 一像素一豆
})

const pixelArt = createPixelArtPrepPixels(pixels, width, height, 64)`

export const BEAD_CORE_CODE_EDIT = `import {
  fillRegion,
  paintRect,
  trimGrid,
  flipGridHorizontal,
  flipGridVertical,
  cloneGrid,
  computeColorStats,
  countTotalBeads,
} from '${BEAD_CORE_NPM_PACKAGE}'

grid = fillRegion(grid, row, col, 'red-01', '#E74C3C')
grid = paintRect(grid, row0, col0, row1, col1, 'blue-01', '#3498DB')
grid = trimGrid(grid)
grid = flipGridHorizontal(grid)
grid = flipGridVertical(grid)

const copy = cloneGrid(grid)
const total = countTotalBeads(grid)
const stats = computeColorStats(grid, 'MARD', codeLookup)`
