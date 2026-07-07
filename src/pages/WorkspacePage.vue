<script setup lang="ts">
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import { showToast, showModal, showActionSheet, getSystemInfoSync, setClipboardData } from '@/utils/platform-ui'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePageSeo } from '@/utils/seo'
import AiPreprocessSheet from '@/components/AiPreprocessSheet.vue'
import ImportModeSheet from '@/components/ImportModeSheet.vue'
import BeadCanvas from '@/components/BeadCanvas.vue'
import ColorPanel from '@/components/ColorPanel.vue'
import CompareSheet from '@/components/CompareSheet.vue'
import ExportSheet from '@/components/ExportSheet.vue'
import ImageCropperModal from '@/components/ImageCropperModal.vue'
import ProjectSaveSheet from '@/components/ProjectSaveSheet.vue'
import SettingsDrawer from '@/components/SettingsDrawer.vue'
import XhsImportSheet from '@/components/XhsImportSheet.vue'
import WorkspaceParamStrip from '@/components/WorkspaceParamStrip.vue'
import WorkspaceUploadZone from '@/components/WorkspaceUploadZone.vue'
import WorkspaceWorkflowGuide from '@/components/WorkspaceWorkflowGuide.vue'
import TemplatePickerSheet from '@/components/TemplatePickerSheet.vue'
import { useFocusStore } from '@/stores/focus'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { type ExportSettings } from '@/types/app'
import { trimGrid } from '@wangdandan810012/bead-core'
import { encodeProjectShare } from '@/utils/projectShare'
import { debounce } from '@/utils/debounce'
import {
  applySuggestedParamsForImage,
  applySuggestedParamsForPrepImage,
  hydrateProjectSourceFromPath,
  loadImageToProject,
  pickImage,
  processCurrentProject,
} from '@/utils/pipeline'
import type { PrepImageMeta } from '@pindou/app-shared/utils/suggestParams'
import {
  buildColorStats,
  downloadBlobH5,
  downloadDataUrlH5,
  downloadTextH5,
  exportPatternPdf,
  exportStatsCsv,
  renderPatternCanvas,
  renderStatsCanvas,
} from '@/utils/export'
import { ProjectStorage, createProjectId } from '@/utils/projectStorage'
import { loadImageFromFile, pickImageFileFromClipboard } from '@/utils/pickImage'
import { createSourcePreview, gridMeta, renderGridThumbnail } from '@/utils/thumbnail'
import { createBeadPrepImage } from '@/utils/beadPrepImage'
import {
  defaultPreviewContainerWidth,
  observeElementWidth,
} from '@/utils/fitCellSize'

usePageSeo('workspace')

const router = useRouter()
const project = useProjectStore()
const paletteStore = usePaletteStore()
const focus = useFocusStore()
const exportCanvasId = 'pindou-export-canvas'
const previewWrapId = 'workspace-preview-wrap'
const previewMeasureId = 'workspace-preview-measure'
const previewWidth = ref(defaultPreviewContainerWidth())
const beadCanvasRef = ref<InstanceType<typeof BeadCanvas> | null>(null)
let stopPreviewObserve: (() => void) | null = null


const h5PreviewPan = {
  active: false,
  moved: false,
  startX: 0,
  startY: 0,
  scrollLeft: 0,
  scrollTop: 0,
}

const PREVIEW_ZOOM_MIN = 0.5
const PREVIEW_ZOOM_MAX = 3
const previewZoom = ref(1)

const pinchZoom = {
  active: false,
  startDistance: 0,
  startZoom: 1,
  anchorX: 0,
  anchorY: 0,
}

function clampPreviewZoom(value: number) {
  return Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, value))
}

function touchDistance(touches: TouchList) {
  if (touches.length < 2) return 0
  const dx = touches[1].clientX - touches[0].clientX
  const dy = touches[1].clientY - touches[0].clientY
  return Math.hypot(dx, dy)
}

function touchCenter(touches: TouchList) {
  if (touches.length < 2) return { x: 0, y: 0 }
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  }
}

function setPreviewZoomAt(nextZoom: number, anchorX?: number, anchorY?: number) {
  const g = project.grid
  const el = getH5PreviewScrollEl()
  if (!g?.length) return

  const cols = g[0]?.length ?? 1
  const rows = g.length
  const base = basePreviewCellSize.value
  const prevZoom = previewZoom.value
  const zoom = clampPreviewZoom(nextZoom)
  if (Math.abs(zoom - prevZoom) < 0.001) return

  const prevW = cols * base * prevZoom
  const prevH = rows * base * prevZoom

  previewZoom.value = zoom

  if (!el || anchorX === undefined || anchorY === undefined || prevW <= 0 || prevH <= 0) return

  const rect = el.getBoundingClientRect()
  const ratioX = (el.scrollLeft + anchorX - rect.left) / prevW
  const ratioY = (el.scrollTop + anchorY - rect.top) / prevH

  nextTick(() => {
    const newW = cols * base * zoom
    const newH = rows * base * zoom
    el.scrollLeft = Math.max(0, ratioX * newW - (anchorX - rect.left))
    el.scrollTop = Math.max(0, ratioY * newH - (anchorY - rect.top))
  })
}

function zoomPreviewBy(factor: number, anchorX?: number, anchorY?: number) {
  setPreviewZoomAt(previewZoom.value * factor, anchorX, anchorY)
}

function zoomPreviewIn() {
  zoomPreviewBy(1.2)
}

function zoomPreviewOut() {
  zoomPreviewBy(1 / 1.2)
}

function resetPreviewZoom() {
  setPreviewZoomAt(1)
  nextTick(() => {
    const el = getH5PreviewScrollEl()
    if (el) {
      el.scrollLeft = 0
      el.scrollTop = 0
    }
  })
}

function getH5PreviewScrollEl(event?: Event): HTMLElement | null {
  const fromEvent = event?.currentTarget as HTMLElement | undefined
  if (fromEvent) return fromEvent
  return (
    document.getElementById(previewWrapId) ??
    (document.querySelector(`#${previewWrapId}`) as HTMLElement | null)
  )
}

function syncPreviewViewportWidth() {
  const el = getH5PreviewScrollEl()
  if (el?.clientWidth && el.clientWidth > 0) {
    previewWidth.value = el.clientWidth
  }
}

function onH5PreviewTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    h5PreviewPan.active = false
    h5PreviewPan.moved = true
    pinchZoom.active = true
    pinchZoom.startDistance = touchDistance(event.touches)
    pinchZoom.startZoom = previewZoom.value
    const center = touchCenter(event.touches)
    pinchZoom.anchorX = center.x
    pinchZoom.anchorY = center.y
    return
  }

  pinchZoom.active = false
  const el = getH5PreviewScrollEl(event)
  const touch = event.touches[0]
  if (!el || !touch) return
  h5PreviewPan.active = true
  h5PreviewPan.moved = false
  h5PreviewPan.startX = touch.clientX
  h5PreviewPan.startY = touch.clientY
  h5PreviewPan.scrollLeft = el.scrollLeft
  h5PreviewPan.scrollTop = el.scrollTop
}

function onH5PreviewTouchMove(event: TouchEvent) {
  if (pinchZoom.active && event.touches.length === 2) {
    const dist = touchDistance(event.touches)
    if (pinchZoom.startDistance > 0) {
      const center = touchCenter(event.touches)
      setPreviewZoomAt(
        pinchZoom.startZoom * (dist / pinchZoom.startDistance),
        center.x,
        center.y,
      )
    }
    return
  }

  if (!h5PreviewPan.active) return
  const el = getH5PreviewScrollEl(event)
  const touch = event.touches[0]
  if (!el || !touch) return
  const dx = touch.clientX - h5PreviewPan.startX
  const dy = touch.clientY - h5PreviewPan.startY
  if (!h5PreviewPan.moved && Math.hypot(dx, dy) < 4) return
  h5PreviewPan.moved = true
  el.scrollLeft = h5PreviewPan.scrollLeft - dx
  el.scrollTop = h5PreviewPan.scrollTop - dy
}

function onH5PreviewTouchEnd(event: TouchEvent) {
  if (event.touches.length < 2) {
    pinchZoom.active = false
  }
  if (pinchZoom.active) return

  if (!h5PreviewPan.moved) {
    const touch = event.changedTouches[0]
    if (touch) beadCanvasRef.value?.resolveTapAt(touch.clientX, touch.clientY)
  }
  h5PreviewPan.active = false
  h5PreviewPan.moved = false
}

function onH5PreviewMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  const el = getH5PreviewScrollEl(event)
  if (!el) return
  h5PreviewPan.active = true
  h5PreviewPan.moved = false
  h5PreviewPan.startX = event.clientX
  h5PreviewPan.startY = event.clientY
  h5PreviewPan.scrollLeft = el.scrollLeft
  h5PreviewPan.scrollTop = el.scrollTop
  document.addEventListener('mousemove', onH5PreviewMouseMove)
  document.addEventListener('mouseup', onH5PreviewMouseUp, { once: true })
}

function onH5PreviewMouseMove(event: MouseEvent) {
  if (!h5PreviewPan.active) return
  const el = getH5PreviewScrollEl()
  if (!el) return
  const dx = event.clientX - h5PreviewPan.startX
  const dy = event.clientY - h5PreviewPan.startY
  if (!h5PreviewPan.moved && Math.hypot(dx, dy) < 4) return
  h5PreviewPan.moved = true
  el.scrollLeft = h5PreviewPan.scrollLeft - dx
  el.scrollTop = h5PreviewPan.scrollTop - dy
}

function onH5PreviewMouseUp(event: MouseEvent) {
  document.removeEventListener('mousemove', onH5PreviewMouseMove)
  if (h5PreviewPan.active && !h5PreviewPan.moved) {
    beadCanvasRef.value?.resolveTapAt(event.clientX, event.clientY)
  }
  h5PreviewPan.active = false
  h5PreviewPan.moved = false
}

function onH5PreviewWheel(event: WheelEvent) {
  const el = getH5PreviewScrollEl()
  if (!el) return

  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    const factor = event.deltaY > 0 ? 0.9 : 1.1
    zoomPreviewBy(factor, event.clientX, event.clientY)
    return
  }

  if (Math.abs(event.deltaX) > 0) {
    el.scrollLeft += event.deltaX
    event.preventDefault()
    return
  }
  if (event.shiftKey && Math.abs(event.deltaY) > 0) {
    el.scrollLeft += event.deltaY
    event.preventDefault()
  }
}

const processing = ref(false)
const processingHint = ref('正在生成图纸…')
const exportVisible = ref(false)
const settingsVisible = ref(false)
const cropperVisible = ref(false)
const importModeVisible = ref(false)
const saveVisible = ref(false)
const saveLoading = ref(false)
const compareVisible = ref(false)
const aiVisible = ref(false)
const templateVisible = ref(false)
const xhsVisible = ref(false)
const tipsExpanded = ref(false)
const pendingImagePath = ref('')
const dragOver = ref(false)
const dragDepth = ref(0)

const SAMPLE_IMAGES = [
  { label: '小猫', path: '/static/gallery/demo-cat.svg' },
  { label: '花朵', path: '/static/gallery/demo-flower.svg' },
  { label: '风景', path: '/static/gallery/demo-landscape.svg' },
  { label: '头像', path: '/static/gallery/demo-icon.svg' },
]

const hasSource = computed(() => !!project.sourcePixels || !!project.sourcePreview)
const hasGrid = computed(() => project.hasGrid)

const stats = computed(() => {
  if (!project.grid) return []
  return buildColorStats(project.grid, paletteStore.brand, (id) => paletteStore.getDisplayCode(id))
})

const compareSource = computed(() => project.sourcePreview || project.sourcePath)
const gridInfo = computed(() => (project.grid ? gridMeta(project.grid) : null))
const isUpdateSave = computed(() => !!project.savedProjectId)

function copyProjectShareCode() {
  if (!project.grid) return
  try {
    const code = encodeProjectShare({
      name: project.projectName,
      params: { ...project.params },
      grid: project.grid,
      excludedPaletteIds: [...project.excludedPaletteIds],
      completedCells: focus.exportCompleted(),
    })
    setClipboardData({
      data: code,
      success: () => showToast({ title: '已复制分享码', icon: 'success' }),
    })
  } catch (error) {
    showToast({
      title: error instanceof Error ? error.message : '生成分享码失败',
      icon: 'none',
    })
  }
}

/** 预览格点：120×120 等大图固定 6px，保证可横纵拖动查看 */
const PREVIEW_MIN_CELL = 6
const LARGE_GRID_THRESHOLD = 60
/** 预览基础格点（未缩放） */
const basePreviewCellSize = computed(() => {
  const g = project.grid
  if (!g?.length || previewWidth.value <= 0) return PREVIEW_MIN_CELL
  const cols = g[0]?.length ?? 1
  const rows = g.length
  if (cols >= LARGE_GRID_THRESHOLD || rows >= LARGE_GRID_THRESHOLD) {
    return PREVIEW_MIN_CELL
  }
  const fitCell = previewWidth.value / cols
  if (cols * PREVIEW_MIN_CELL > previewWidth.value + 0.5) return PREVIEW_MIN_CELL
  return Math.max(PREVIEW_MIN_CELL, Math.floor(fitCell))
})

const previewCellSize = computed(() =>
  Math.max(2, Math.floor(basePreviewCellSize.value * previewZoom.value)),
)

const previewCanvasSize = computed(() => {
  const g = project.grid
  if (!g?.length) return { width: 0, height: 0 }
  const cols = g[0]?.length ?? 1
  const rows = g.length
  const cell = previewCellSize.value
  return {
    width: cols * cell,
    height: rows * cell,
  }
})

const previewViewportStyle = computed(() => {
  const rows = project.grid?.length ?? 0
  const canvasHeight = rows * previewCellSize.value
  const maxHeight = Math.round(getSystemInfoSync().windowHeight * 0.68)
  const height = canvasHeight > 0 ? Math.min(canvasHeight, maxHeight) : 220
  return { height: `${Math.max(180, height)}px` }
})

const previewContentStyle = computed(() => {
  const size = previewCanvasSize.value
  if (size.width <= 0 || size.height <= 0) return {}
  return {
    width: `${size.width}px`,
    height: `${size.height}px`,
  }
})

function startPreviewWidthObserve() {
  stopPreviewObserve?.()
  const el = document.getElementById(previewMeasureId)
  stopPreviewObserve = observeElementWidth(el, (w) => {
    previewWidth.value = w
    nextTick(() => syncPreviewViewportWidth())
  })
  nextTick(() => syncPreviewViewportWidth())
}

const statusText = computed(() => {
  if (!hasGrid.value) return ''
  if (project.dirty) return '未保存'
  if (project.savedProjectId) return '已保存'
  return '未保存'
})

const debouncedReprocess = debounce(() => {
  reprocess()
}, 300)

const debouncedQuickReprocess = debounce(() => {
  reprocess()
}, 180)

onMounted(async () => {
  await paletteStore.loadPalettes()
  paletteStore.setPreset(project.params.palettePresetId)
  if (project.grid && !project.sourcePixels) {
    await ensureSourceForReprocess()
  }
  await nextTick()
  startPreviewWidthObserve()
  window.addEventListener('paste', onWindowPaste)
})

onUnmounted(() => {
  stopPreviewObserve?.()
  window.removeEventListener('paste', onWindowPaste)
})

watch(hasGrid, async (ready) => {
  if (!ready) {
    previewZoom.value = 1
    return
  }
  await nextTick()
  startPreviewWidthObserve()
})

watch(processing, async (busy) => {
  if (!busy && hasGrid.value) {
    await nextTick()
    startPreviewWidthObserve()
  }
})

async function startPickImage() {
  try {
    const path = await pickImage()
    pendingImagePath.value = path
    cropperVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

function openImagePath(path: string) {
  pendingImagePath.value = path
  cropperVisible.value = true
}

function openImageFile(file: File) {
  try {
    const path = loadImageFromFile(file)
    openImagePath(path)
  } catch (error) {
    showToast({ title: error instanceof Error ? error.message : '无法读取图片', icon: 'none' })
  }
}

function onWindowPaste(event: ClipboardEvent) {
  if (
    cropperVisible.value ||
    importModeVisible.value ||
    aiVisible.value ||
    exportVisible.value ||
    settingsVisible.value ||
    xhsVisible.value
  ) {
    return
  }
  const items = event.clipboardData?.items
  if (!items?.length) return
  const file = pickImageFileFromClipboard(items)
  if (!file) return
  event.preventDefault()
  openImageFile(file)
}

function onDragEnter(event: DragEvent) {
  event.preventDefault()
  dragDepth.value += 1
  dragOver.value = true
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) dragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragDepth.value = 0
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    openImageFile(file)
  } else if (file) {
    showToast({ title: '请选择图片文件（JPG / PNG / WebP）', icon: 'none' })
  }
}

function onTemplatePick(path: string) {
  openImagePath(path)
}

function trySample(path: string) {
  openImagePath(path)
}

function onPickImage() {
  startPickImage()
}

function onReplaceImage() {
  if (hasGrid.value && project.dirty) {
    showModal({
      title: '更换图片',
      content: '当前项目有未保存修改，换图后将重新生成图纸。',
      success: (res) => {
        if (res.confirm) startPickImage()
      },
    })
    return
  }
  startPickImage()
}

async function onAiPick() {
  try {
    const path = await pickImage()
    pendingImagePath.value = path
    aiVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

async function onAiDone(path: string) {
  pendingImagePath.value = path
  cropperVisible.value = true
}

async function onXhsSelect(dataUrl: string) {
  pendingImagePath.value = dataUrl
  cropperVisible.value = true
}

function onTrimGrid() {
  if (!project.grid) return
  const trimmed = trimGrid(project.grid)
  project.setGrid(trimmed)
  showToast({ title: '已自动裁边', icon: 'success' })
}

async function onCropConfirm(path: string) {
  cropperVisible.value = false
  pendingImagePath.value = path
  importModeVisible.value = true
}

async function finalizeImportedImage(
  path: string,
  successTitle = '生成成功',
  options?: { fromPrepImage?: boolean; prepMeta?: PrepImageMeta },
) {
  processing.value = true
  try {
    const loaded = await loadImageToProject(path)
    if (options?.fromPrepImage) {
      applySuggestedParamsForPrepImage(loaded.width, loaded.height, loaded.pixels, options.prepMeta)
    } else {
      applySuggestedParamsForImage(loaded.width, loaded.height, loaded.pixels)
    }
    paletteStore.setPreset(project.params.palettePresetId)
    const preview = await createSourcePreview(path)
    project.setSourcePreview(preview)
    processingHint.value = '正在生成图纸…'
    await processCurrentProject()
    showToast({ title: successTitle, icon: 'success' })
  } catch (error) {
    showToast({ title: '处理失败', icon: 'none' })
    console.error(error)
  } finally {
    processing.value = false
    processingHint.value = '正在生成图纸…'
  }
}

async function onImportModeChoose(mode: 'direct' | 'bead-prep') {
  importModeVisible.value = false
  const path = pendingImagePath.value
  if (!path) return

  if (mode === 'direct') {
    await finalizeImportedImage(path)
    return
  }

  processing.value = true
  try {
    const prep = await createBeadPrepImage(path, (progress) => {
      processingHint.value = progress.message
    })
    await finalizeImportedImage(prep.dataUrl, '已用拼豆专用图生成图纸', {
      fromPrepImage: true,
      prepMeta: {
        gridWidth: prep.gridWidth,
        gridHeight: prep.gridHeight,
        colorCount: prep.colorCount,
      },
    })
  } catch (error) {
    showToast({ title: '拼豆专用图生成失败', icon: 'none' })
    console.error(error)
    processing.value = false
    processingHint.value = '正在生成图纸…'
  }
}

async function ensureSourceForReprocess(): Promise<boolean> {
  if (project.sourcePixels) return true
  const path = project.sourcePreview || project.sourcePath
  if (!path) return false
  return hydrateProjectSourceFromPath(path)
}

async function reprocess() {
  if (!project.sourcePixels) {
    const ok = await ensureSourceForReprocess()
    if (!ok) {
      showToast({
        title: '缺少原图数据，请点「换图」重新上传后再调格数',
        icon: 'none',
      })
      return
    }
  }
  processing.value = true
  try {
    await nextTick()
    paletteStore.setPreset(project.params.palettePresetId)
    await processCurrentProject()
  } finally {
    processing.value = false
  }
}

function onParamUpdate(params: Partial<typeof project.params>) {
  project.setParams(params)
  if (params.palettePresetId) paletteStore.setPreset(params.palettePresetId)
  debouncedReprocess()
}

function onQuickParamUpdate(params: Partial<typeof project.params>) {
  project.setParams(params)
  if (params.palettePresetId) paletteStore.setPreset(params.palettePresetId)
  debouncedQuickReprocess()
}

function onBrandChange(brand: typeof paletteStore.brand) {
  paletteStore.setBrand(brand)
}

function onApplyPreset(preset: import('@/types/app').ParamPreset) {
  project.setParams({ ...preset.params })
  paletteStore.setPreset(preset.params.palettePresetId)
  paletteStore.setBrand(preset.brand)
  reprocess()
}

async function toggleExcluded(id: string) {
  project.toggleExcluded(id)
  await reprocess()
}

async function restoreAll() {
  project.restoreAllExcluded()
  await reprocess()
}

function goEditor() {
  if (!project.hasGrid) return
  router.push('/editor')
}

function goFocus() {
  if (!project.hasGrid) return
  router.push('/focus')
}

function goPreview3d() {
  if (!project.hasGrid) return
  router.push('/preview3d')
}

function openSave() {
  if (!project.grid) return
  saveVisible.value = true
}

async function confirmSave(name: string) {
  if (!project.grid || saveLoading.value) return
  saveLoading.value = true
  try {
    const wasUpdate = !!project.savedProjectId
    const id = project.savedProjectId ?? createProjectId()
    const thumbnail = await renderGridThumbnail(project.grid)
    const saved = {
      id,
      name,
      updatedAt: Date.now(),
      thumbnail: thumbnail || undefined,
      sourcePreview: project.sourcePreview || undefined,
      params: { ...project.params },
      grid: project.grid,
      excludedPaletteIds: [...project.excludedPaletteIds],
      completedCells: focus.exportCompleted(),
    }
    ProjectStorage.save(saved)
    project.projectName = name
    project.savedProjectId = id
    project.dirty = false
    saveVisible.value = false
    showToast({ title: wasUpdate ? '已更新，正在打开项目列表' : '已保存，正在打开项目列表', icon: 'success' })
    router.push('/projects')
  } catch (error) {
    showToast({
      title: error instanceof Error ? error.message : '保存失败',
      icon: 'none',
    })
  } finally {
    saveLoading.value = false
  }
}

async function handleExport(settings: ExportSettings) {
  if (!project.grid) return
  exportVisible.value = false
  const codeLookup = (id: string) => paletteStore.getDisplayCode(id)
  const csv = exportStatsCsv(stats.value)

  
  if (settings.format === 'pdf') {
    const pdf = await exportPatternPdf(project.grid, settings, codeLookup, project.projectName, stats.value)
    if (pdf) downloadBlobH5('pindou-pattern.pdf', pdf)
    showToast({ title: 'PDF 已导出', icon: 'success' })
    return
  }

  const pattern = await renderPatternCanvas(project.grid, settings, codeLookup)
  if (settings.format === 'png' || settings.format === 'all') {
    downloadDataUrlH5('pindou-pattern.png', pattern)
  }
  if (settings.format === 'all') {
    const statImage = await renderStatsCanvas(stats.value)
    if (statImage) downloadDataUrlH5('pindou-stats.png', statImage)
    downloadTextH5('pindou-stats.csv', csv, 'text/csv')
  }
  showToast({ title: '导出完成', icon: 'success' })
}
</script>

<template>
  <div class="page page--dock page--workspace">
    <!-- 项目信息 -->
    <section
      v-if="hasGrid || project.projectName !== '未命名项目'"
      class="workspace-hero card"
    >
      <div class="workspace-hero__media">
        <img v-if="compareSource" class="workspace-hero__thumb" :src="compareSource" alt="" />
        <div v-else class="workspace-hero__thumb workspace-hero__thumb--empty" aria-hidden="true">◇</div>
      </div>
      <div class="workspace-hero__body">
        <div class="workspace-hero__title-row">
          <h1 class="workspace-hero__name">{{ project.projectName }}</h1>
          <span
            v-if="statusText"
            class="badge"
            :class="project.dirty ? 'badge--warn' : 'badge--ok'"
          >{{ statusText }}</span>
          <button
            v-if="hasGrid"
            type="button"
            class="hero-save-btn"
            @click="openSave"
          >
            保存
          </button>
        </div>
        <div v-if="gridInfo" class="workspace-hero__chips">
          <span class="stat-chip">{{ gridInfo.cols }}×{{ gridInfo.rows }}</span>
          <span class="stat-chip">{{ gridInfo.colorCount }} 色</span>
          <span class="stat-chip">{{ gridInfo.beads }} 豆</span>
        </div>
        <span v-else class="workspace-hero__meta">等待生成图纸</span>
      </div>
    </section>

    <!-- 使用引导 -->
    <WorkspaceWorkflowGuide
      :has-grid="hasGrid"
      @pick-image="onPickImage"
      @go-editor="goEditor"
      @open-settings="settingsVisible = true"
    />

    <!-- 工具栏 -->
    <section class="workspace-toolbar card">
      <div class="workspace-toolbar__scroll">
        <div class="toolbar-group">
          <button
            type="button"
            class="action-chip"
            :class="{ 'action-chip--primary': !hasGrid }"
            @click="hasGrid ? onReplaceImage() : onPickImage()"
          >
            <span class="action-chip__icon" aria-hidden="true">{{ hasGrid ? '↻' : '↑' }}</span>
            <span>{{ hasGrid ? '换图' : '上传' }}</span>
          </button>
          <button type="button" class="action-chip" @click="onAiPick">
            <span class="action-chip__icon" aria-hidden="true">✦</span>
            <span>AI</span>
          </button>
          <button type="button" class="action-chip" @click="templateVisible = true">
            <span class="action-chip__icon" aria-hidden="true">▦</span>
            <span>素材</span>
          </button>
          <button type="button" class="action-chip" @click="xhsVisible = true">
            <span class="action-chip__icon" aria-hidden="true">红</span>
            <span>小红书</span>
          </button>
        </div>
        <span class="toolbar-divider" aria-hidden="true" />
        <div class="toolbar-group">
          <button type="button" class="action-chip" :disabled="!hasGrid" @click="onTrimGrid">
            <span class="action-chip__icon" aria-hidden="true">✂</span>
            <span>裁边</span>
          </button>
          <button type="button" class="action-chip" :disabled="!hasGrid" @click="compareVisible = true">
            <span class="action-chip__icon" aria-hidden="true">⇄</span>
            <span>对比</span>
          </button>
          <button type="button" class="action-chip" @click="settingsVisible = true">
            <span class="action-chip__icon" aria-hidden="true">⚙</span>
            <span>参数</span>
          </button>
        </div>
        <span class="toolbar-divider" aria-hidden="true" />
        <div class="toolbar-group">
          <button type="button" class="action-chip" :disabled="!hasGrid" @click="goPreview3d">
            <span class="action-chip__icon" aria-hidden="true">3D</span>
            <span>预览</span>
          </button>
          <button
            type="button"
            class="action-chip action-chip--save"
            :disabled="!hasGrid"
            @click="openSave"
          >
            <span class="action-chip__icon" aria-hidden="true">↓</span>
            <span>保存</span>
          </button>
          <button
            type="button"
            class="action-chip action-chip--export"
            :disabled="!hasGrid"
            @click="exportVisible = true"
          >
            <span class="action-chip__icon" aria-hidden="true">⤓</span>
            <span>导出</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 快调参数 -->
    <WorkspaceParamStrip
      v-if="hasSource || hasGrid"
      :params="project.params"
      :busy="processing"
      :missing-source="!project.sourcePixels && !project.sourcePreview && !project.sourcePath"
      @update="onQuickParamUpdate"
      @open-settings="settingsVisible = true"
    />

    <!-- 图纸预览 -->
    <section
      class="card preview-card"
      :class="{
        'preview-card--ready': hasGrid,
        'preview-card--drag': dragOver && !hasGrid,
        'preview-card--upload': !hasGrid,
      }"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div v-if="hasGrid" class="preview-head">
        <div>
          <span class="preview-title">图纸预览</span>
          <p class="preview-hint">拖动平移 · Ctrl+滚轮或双指缩放 · 点击查看色号</p>
        </div>
        <div class="preview-head__actions">
          <div class="preview-zoom" role="group" aria-label="预览缩放">
            <button type="button" class="preview-zoom__btn" title="缩小" @click="zoomPreviewOut">−</button>
            <span class="preview-zoom__label">{{ Math.round(previewZoom * 100) }}%</span>
            <button type="button" class="preview-zoom__btn" title="放大" @click="zoomPreviewIn">+</button>
            <button type="button" class="preview-zoom__reset" title="恢复 100%" @click="resetPreviewZoom">
              复位
            </button>
          </div>
          <button type="button" class="preview-edit" @click="goEditor">精修图纸 ›</button>
        </div>
      </div>

      <div v-if="processing && !hasGrid" class="loading-overlay">
        <div class="loading-spinner" />
        <span class="loading-text">{{ processingHint }}</span>
        <span class="loading-sub">本地处理中，大图可能需要几秒</span>
      </div>

      <WorkspaceUploadZone
        v-else-if="!hasGrid"
        :drag-over="dragOver"
        :samples="SAMPLE_IMAGES"
        @pick="onPickImage"
        @template="templateVisible = true"
        @ai="onAiPick"
        @xhs="xhsVisible = true"
        @pixel-text="router.push('/text')"
        @sample="trySample"
      />

      <div v-else class="preview-body">
        <div :id="previewMeasureId" class="preview-measure" />
        <div class="preview-frame">
          <div
            :id="previewWrapId"
            class="preview-canvas-wrap preview-canvas-wrap--h5"
            :style="previewViewportStyle"
            @touchstart="onH5PreviewTouchStart"
            @touchmove.prevent="onH5PreviewTouchMove"
            @touchend="onH5PreviewTouchEnd"
            @touchcancel="onH5PreviewTouchEnd"
            @mousedown="onH5PreviewMouseDown"
            @wheel="onH5PreviewWheel"
          >
            <div class="preview-canvas-inner" :style="previewContentStyle">
              <BeadCanvas
                ref="beadCanvasRef"
                :grid="project.grid!"
                external-scroll
                :cell-size="previewCellSize"
                :show-grid="true"
                :interactive="!processing"
                :code-lookup="(id) => paletteStore.getDisplayCode(id)"
              />
            </div>
          </div>
        </div>
        <div v-if="processing" class="loading-overlay loading-overlay--float">
          <div class="loading-spinner" />
          <span class="loading-text">{{ processingHint }}</span>
          <span class="loading-sub">本地处理中，稍候即可</span>
        </div>
      </div>
    </section>

    <!-- 调优提示（可折叠） -->
    <section v-if="hasGrid" class="card tips-card">
      <button type="button" class="tips-head" @click="tipsExpanded = !tipsExpanded">
        <span class="tips-title">效果调优提示</span>
        <span class="tips-toggle">{{ tipsExpanded ? '收起' : '展开' }}</span>
      </button>
      <div v-if="tipsExpanded" class="tips-body">
        <span class="tip-line">对比原图找差异，适当提高格数与全色系</span>
        <span class="tip-line">照片用「真实/平均色」，卡通用「主导色」</span>
        <span class="tip-line">发糊请提高格数（上限 256）、合并阈值保持 0；重新上传以应用新引擎</span>
      </div>
    </section>

    <ColorPanel
      v-if="stats.length"
      :stats="stats"
      :excluded-ids="project.excludedPaletteIds"
      @toggle="toggleExcluded"
      @restore-all="restoreAll"
    />

    <div class="bottom-dock workspace-dock">
      <PButton
        type="primary"
        size="small"
        text="保存"
        :disabled="!hasGrid"
        @click="openSave"
      />
      <PButton size="small" text="精修图纸" :disabled="!hasGrid" @click="goEditor" />
      <PButton size="small" text="导出" :disabled="!hasGrid" @click="exportVisible = true" />
      <PButton size="small" text="专心拼豆" :disabled="!hasGrid" @click="goFocus" />
    </div>

    <SettingsDrawer
      :show="settingsVisible"
      :params="project.params"
      :brand="paletteStore.brand"
      @close="settingsVisible = false"
      @update="onParamUpdate"
      @brand-change="onBrandChange"
      @apply-preset="onApplyPreset"
    />

    <ImageCropperModal
      :show="cropperVisible"
      :image-path="pendingImagePath"
      @close="cropperVisible = false"
      @confirm="onCropConfirm"
    />

    <ImportModeSheet
      :show="importModeVisible"
      @close="importModeVisible = false"
      @choose="onImportModeChoose"
    />

    <ProjectSaveSheet
      :show="saveVisible"
      :name="project.projectName"
      :is-update="isUpdateSave"
      :loading="saveLoading"
      @close="saveVisible = false"
      @confirm="confirmSave"
      @share="copyProjectShareCode"
    />

    <CompareSheet
      :show="compareVisible"
      :source-src="compareSource"
      :grid="project.grid"
      :code-lookup="(id) => paletteStore.getDisplayCode(id)"
      @close="compareVisible = false"
    />

    <AiPreprocessSheet
      :show="aiVisible"
      :image-path="pendingImagePath"
      @close="aiVisible = false"
      @done="onAiDone"
    />

    <XhsImportSheet
      :show="xhsVisible"
      @close="xhsVisible = false"
      @select="onXhsSelect"
    />

    <TemplatePickerSheet
      :show="templateVisible"
      @close="templateVisible = false"
      @pick="onTemplatePick"
    />

    <ExportSheet :show="exportVisible" @close="exportVisible = false" @confirm="handleExport" />

    
    
    <canvas :id="exportCanvasId" type="2d" class="hidden-canvas" />
    
  </div>
</template>

<style scoped lang="scss">
.page--workspace {
  padding-top: $pindou-space-md;
}

.workspace-hero {
  display: flex;
  gap: $pindou-space-md;
  align-items: center;
  background: $pindou-bg-card;
  border-color: $pindou-border;
  box-shadow: $pindou-shadow-sm;
}

.workspace-hero__media {
  flex-shrink: 0;
}

.workspace-hero__thumb {
  width: 56px;
  height: 56px;
  border-radius: $pindou-radius-sm;
  object-fit: cover;
  border: 1px solid $pindou-border-light;
  box-shadow: $pindou-shadow-sm;

  &--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $pindou-primary-light;
    color: $pindou-primary;
    font-size: 20px;
  }
}

.workspace-hero__body {
  flex: 1;
  min-width: 0;
}

.workspace-hero__title-row {
  display: flex;
  align-items: center;
  gap: $pindou-space-sm;
  flex-wrap: wrap;
}

.hero-save-btn {
  margin-left: auto;
  flex-shrink: 0;
  border: none;
  border-radius: $pindou-radius-pill;
  background: $pindou-primary;
  color: #fff;
  font-size: $pindou-font-xs;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba($pindou-primary, 0.28);
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: $pindou-primary-dark;
  }

  &:active {
    transform: scale(0.98);
  }
}

.workspace-hero__name {
  margin: 0;
  font-family: $pindou-font-display;
  font-weight: 800;
  font-size: $pindou-font-lg;
  color: $pindou-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-hero__meta {
  display: block;
  margin-top: 6px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.workspace-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.08);
  color: $pindou-primary;
  font-size: $pindou-font-xs;
  font-weight: 600;
}

.workspace-toolbar {
  position: relative;
  padding: 10px $pindou-space-md;

  &::after {
    content: '';
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 10px;
    width: 28px;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95));
    border-radius: 0 $pindou-radius-md $pindou-radius-md 0;
  }
}

.toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toolbar-divider {
  flex-shrink: 0;
  width: 1px;
  height: 24px;
  background: $pindou-border-light;
  margin: 0 2px;
}

.workspace-toolbar__scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 2px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid $pindou-border-light;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  font-weight: 500;
  padding: 8px 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    border-color: rgba($pindou-primary, 0.35);
    background: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--primary {
    background: $pindou-primary;
    border-color: $pindou-primary;
    color: #fff;

    &:hover:not(:disabled) {
      background: $pindou-primary-dark;
      border-color: $pindou-primary-dark;
    }
  }

  &--save {
    background: rgba($pindou-primary, 0.08);
    border-color: rgba($pindou-primary, 0.28);
    color: $pindou-primary;
    font-weight: 600;
  }

  &--export {
    background: #fff;
    border-color: rgba($pindou-primary, 0.2);
    color: $pindou-text;
    font-weight: 600;
  }
}

.action-chip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  font-size: 11px;
  line-height: 1;

  .action-chip--primary & {
    background: rgba(255, 255, 255, 0.2);
  }
}

.preview-card {
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

.preview-card--upload {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;

  &:hover {
    border-color: transparent;
    transform: none;
  }
}

.preview-card--ready {
  padding-bottom: $pindou-space-md;
}

.preview-body {
  position: relative;
  margin-top: 4px;
}

.preview-measure {
  width: 100%;
  height: 1px;
  visibility: hidden;
  pointer-events: none;
}

.preview-frame {
  border-radius: $pindou-radius-sm;
  padding: 10px;
  background-color: #f4f5f8;
  background-image:
    linear-gradient(45deg, #e8eaef 25%, transparent 25%),
    linear-gradient(-45deg, #e8eaef 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e8eaef 75%),
    linear-gradient(-45deg, transparent 75%, #e8eaef 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  border: 1px solid $pindou-border-light;
}

.preview-canvas-wrap {
  width: 100%;
  box-sizing: border-box;
}

.preview-canvas-wrap--h5 {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: none;
  overscroll-behavior: contain;
  cursor: grab;
  border-radius: 6px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.preview-canvas-wrap--h5:active {
  cursor: grabbing;
}

.preview-canvas-inner {
  display: block;
  flex-shrink: 0;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.preview-head__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.preview-zoom {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: 8px;
  background: $pindou-bg-muted;
  border: 1px solid $pindou-border-light;
}

.preview-zoom__btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: $pindou-bg-card;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  color: $pindou-text;

  &:hover {
    background: $pindou-bg-muted;
  }
}

.preview-zoom__label {
  min-width: 44px;
  text-align: center;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
}

.preview-zoom__reset {
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: $pindou-font-sm;
  color: $pindou-primary;
  cursor: pointer;

  &:hover {
    background: rgba($pindou-primary, 0.08);
  }
}

.preview-edit {
  flex-shrink: 0;
  border: none;
  background: $pindou-primary;
  color: #fff;
  font-size: $pindou-font-sm;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: $pindou-radius-pill;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $pindou-primary-dark;
  }
}

.preview-hint {
  margin: 4px 0 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
  line-height: 1.4;
}

.preview-title {
  font-size: $pindou-font-md;
  font-weight: 600;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px $pindou-space-lg;
  gap: 10px;
  text-align: center;

  &--float {
    position: absolute;
    inset: 0;
    padding: $pindou-space-lg;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(4px);
    border-radius: $pindou-radius-sm;
    z-index: 2;
  }
}

.loading-text {
  color: $pindou-text;
  font-size: $pindou-font-md;
  font-weight: 600;
}

.loading-sub {
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
}

.tips-card {
  padding: 10px $pindou-space-md;
}

.tips-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: none;
  background: transparent;
  padding: 4px 0;
  cursor: pointer;
  text-align: left;
}

.tips-title {
  font-size: 13px;
  font-weight: 600;
  color: $pindou-text-secondary;
}

.tips-toggle {
  font-size: $pindou-font-sm;
  color: $pindou-primary;
}

.tips-body {
  margin-top: $pindou-space-sm;
  padding-top: $pindou-space-sm;
  border-top: 1px solid $pindou-border-light;
}

.tip-line {
  display: block;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.7;
  padding-left: 12px;
  position: relative;

  &::before {
    content: '·';
    position: absolute;
    left: 0;
    color: $pindou-primary;
    font-weight: 700;
  }
}

.workspace-dock {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: min(#{$pindou-content-wide}, calc(100% - 24px));
  padding: 8px 10px;
  gap: 6px;
  border: 1px solid rgba($pindou-primary, 0.12);
  background: rgba(255, 255, 255, 0.96);

  :deep(.p-btn) {
    flex: 1;
    min-height: 44px;
    font-size: $pindou-font-sm;
    font-weight: 600;
    border-radius: $pindou-radius-sm;
  }

  :deep(.p-btn--primary) {
    box-shadow: 0 4px 14px rgba($pindou-primary, 0.3);
  }

  :deep(.p-btn:not(.p-btn--primary)) {
    background: $pindou-bg-muted;
    border-color: $pindou-border-light;
  }
}
</style>
