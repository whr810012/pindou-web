import { type ComputedRef, type Ref, computed } from 'vue'
import type { MappedGrid } from '@pindou/bead-core'

export function useFitCellSize(
  grid: ComputedRef<MappedGrid | null>,
  containerWidth: Ref<number>,
  maxHeight = 420,
  minCell = 2,
) {
  return computed(() => {
    const g = grid.value
    if (!g?.length || containerWidth.value <= 0) return 8
    const rows = g.length
    const cols = g[0]?.length ?? 1
    const cellByW = Math.floor(containerWidth.value / cols)
    const cellByH = Math.floor(maxHeight / rows)
    return Math.max(minCell, Math.min(cellByW, cellByH))
  })
}

export function useFillWidthCellSize(
  grid: ComputedRef<MappedGrid | null>,
  containerWidth: Ref<number>,
  minCell = 2,
) {
  return computed(() => {
    const g = grid.value
    if (!g?.length || containerWidth.value <= 0) return 8
    const cols = g[0]?.length ?? 1
    return Math.max(minCell, containerWidth.value / cols)
  })
}

export function defaultPreviewContainerWidth(): number {
  return Math.max(260, window.innerWidth - 24)
}

export function observeElementWidth(
  el: HTMLElement | null,
  onWidth: (width: number) => void,
): () => void {
  if (!el) return () => {}
  const report = () => {
    const w = el.clientWidth
    if (w > 0) onWidth(w)
  }
  report()
  if (typeof ResizeObserver === 'undefined') return () => {}
  const ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect?.width ?? 0
    if (w > 0) onWidth(w)
  })
  ro.observe(el)
  return () => ro.disconnect()
}
