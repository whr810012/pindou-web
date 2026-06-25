<script setup lang="ts">
import PButton from '@/components/ui/PButton.vue'
import PTag from '@/components/ui/PTag.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast, showActionSheet } from '@/utils/platform-ui'
import { computed, ref } from 'vue'
import BeadCanvas from '@/components/BeadCanvas.vue'
import MagnifierOverlay from '@/components/MagnifierOverlay.vue'
import { useFocusStore } from '@/stores/focus'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { buildColorStats } from '@/utils/export'
import { ZONE_SPLIT_OPTIONS, zoneLabel } from '@/utils/focusZones'
import { usePageSeo } from '@/utils/seo'

usePageSeo('focus')

const project = useProjectStore()
const paletteStore = usePaletteStore()
const focus = useFocusStore()

const magnifierPos = ref<{ row: number; col: number } | null>(null)

const grid = computed(() => project.grid)
const zoneProgress = computed(() => focus.progress(project.grid))
const totalProgress = computed(() => focus.totalProgress(project.grid))
const statProgressMap = computed(() => focus.paletteProgressMap(project.grid))

const stats = computed(() => {
  if (!project.grid) return []
  return buildColorStats(project.grid, paletteStore.brand, (id) => paletteStore.getDisplayCode(id))
})

const zoneCells = computed(() => {
  const cells: Array<{ zoneRow: number; zoneCol: number; label: string }> = []
  const split = focus.zoneSplit
  for (let r = 0; r < split.rows; r++) {
    for (let c = 0; c < split.cols; c++) {
      cells.push({ zoneRow: r, zoneCol: c, label: zoneLabel(split, r, c) })
    }
  }
  return cells
})

const focusRenderKey = computed(
  () =>
    `${focus.zoneEnabled}-${focus.activeZoneRow}-${focus.activeZoneCol}-${focus.zoneSplit.rows}-${focus.zoneSplit.cols}-${focus.highlightPaletteId ?? ''}`,
)

function isZoneActive(row: number, col: number) {
  return focus.isZoneCellActive(project.grid, row, col)
}

function onCellTap({ row, col }: { row: number; col: number }) {
  if (!project.grid) return
  const cell = project.grid[row][col]
  if (cell.isExternal) return
  if (focus.zoneEnabled && !isZoneActive(row, col)) {
    showToast({ title: '请先切换到该分区', icon: 'none' })
    return
  }
  focus.toggleCell(row, col)
  magnifierPos.value = { row, col }
}

function highlightStat(paletteId: string) {
  focus.setHighlight(paletteId)
}

function onStatLongPress(stat: { paletteId: string; displayCode: string; count: number }) {
  if (!project.grid) return
  const progress = statProgressMap.value.get(stat.paletteId) ?? { done: 0, total: 0 }
  const doneAll = progress.done === progress.total && progress.total > 0

  showActionSheet({
    itemList: [
      doneAll ? `取消「${stat.displayCode}」标记` : `标记「${stat.displayCode}」全部完成 (${stat.count}豆)`,
      `高亮「${stat.displayCode}」`,
    ],
    success: (res) => {
      if (res.tapIndex === 0) {
        if (doneAll) focus.unmarkPaletteComplete(project.grid!, stat.paletteId)
        else focus.markPaletteComplete(project.grid!, stat.paletteId)
        showToast({
          title: doneAll ? '已取消标记' : `已标记 ${stat.count} 豆`,
          icon: 'success',
        })
      } else if (res.tapIndex === 1) {
        highlightStat(stat.paletteId)
      }
    },
  })
}

let statLongPressTimer: ReturnType<typeof setTimeout> | null = null
let statLongPressTriggered = false

function onStatPointerDown(stat: { paletteId: string; displayCode: string; count: number }) {
  statLongPressTriggered = false
  statLongPressTimer = setTimeout(() => {
    statLongPressTriggered = true
    onStatLongPress(stat)
  }, 500)
}

function clearStatLongPress() {
  if (statLongPressTimer) clearTimeout(statLongPressTimer)
  statLongPressTimer = null
}

function onStatClick(paletteId: string) {
  if (statLongPressTriggered) {
    statLongPressTriggered = false
    return
  }
  highlightStat(paletteId)
}

function statBadge(paletteId: string) {
  return statProgressMap.value.get(paletteId) ?? { done: 0, total: 0 }
}
</script>

<template>
  <div class="page page--dock">
    <div v-if="!grid" class="empty">请先在工作台生成图纸</div>
    <template v-else>
      <div class="progress card">
        <span v-if="focus.zoneEnabled">
          当前分区 {{ zoneProgress.percent }}%（{{ zoneProgress.done }}/{{ zoneProgress.total }}）
          · 总进度 {{ totalProgress.percent }}%
        </span>
        <span v-else>总进度 {{ zoneProgress.percent }}%（{{ zoneProgress.done }}/{{ zoneProgress.total }}）</span>
        <PLineProgress :percentage="zoneProgress.percent" :height="8" />
      </div>

      <div class="card zone-bar">
        <div class="zone-row">
          <PButton
            size="mini"
            :type="focus.zoneEnabled ? 'primary' : 'default'"
            :text="focus.zoneEnabled ? '分区中' : '分区模式'"
            @click="focus.toggleZoneMode()"
          />
          <PButton v-if="focus.zoneEnabled" size="mini" plain text="下一区" @click="focus.nextZone()" />
        </div>
        <div v-if="focus.zoneEnabled" scroll-x class="zone-tabs">
          <div
            v-for="zone in zoneCells"
            :key="`${zone.zoneRow}-${zone.zoneCol}`"
            class="zone-tab chip"
            :class="{
              'chip--active':
                focus.activeZoneRow === zone.zoneRow && focus.activeZoneCol === zone.zoneCol,
            }"
            @click="focus.setActiveZone(zone.zoneRow, zone.zoneCol)"
          >
            {{ zone.label }}
          </div>
        </div>
        <div v-if="focus.zoneEnabled" scroll-x class="split-row">
          <PTag
            v-for="(split, index) in ZONE_SPLIT_OPTIONS"
            :key="index"
            :text="`${split.rows}×${split.cols}`"
            size="mini"
            :plain="
              focus.zoneSplit.rows !== split.rows || focus.zoneSplit.cols !== split.cols
            "
            @click="focus.setZoneSplit(split)"
          />
        </div>
      </div>

      <div scroll-x class="palette-row">
        <div
          v-for="stat in stats"
          :key="stat.paletteId"
          class="chip"
          :class="{ 'chip--outline-active': focus.highlightPaletteId === stat.paletteId }"
          @click="onStatClick(stat.paletteId)"
          @pointerdown="onStatPointerDown(stat)"
          @pointerup="clearStatLongPress"
          @pointerleave="clearStatLongPress"
          @pointercancel="clearStatLongPress"
          @contextmenu.prevent="onStatLongPress(stat)"
        >
          <div class="swatch" :style="{ backgroundColor: stat.hex }">
            <span v-if="statBadge(stat.paletteId).total" class="badge">
              {{ statBadge(stat.paletteId).done }}/{{ statBadge(stat.paletteId).total }}
            </span>
          </div>
          <span>{{ stat.displayCode }}</span>
        </div>
      </div>

      <div class="canvas-scroll" scroll-x scroll-y>
        <BeadCanvas
          :grid="grid"
          :cell-size="12"
          :show-grid="true"
          :interactive="true"
          :simple-external="true"
          :highlight-palette-id="focus.highlightPaletteId"
          :completed-cells="focus.completedCells"
          :render-key="focusRenderKey"
          :is-zone-active="focus.zoneEnabled ? isZoneActive : undefined"
          :code-lookup="(id) => paletteStore.getDisplayCode(id)"
          @cell-tap="onCellTap"
        />
      </div>

      <MagnifierOverlay
        v-if="magnifierPos"
        :visible="focus.magnifierEnabled"
        :grid="grid"
        :row="magnifierPos.row"
        :col="magnifierPos.col"
        :cell-size="12"
        :code-lookup="(id) => paletteStore.getDisplayCode(id)"
      />

      <div class="bottom-dock">
        <PButton
          size="small"
          :text="focus.magnifierEnabled ? '关闭放大镜' : '打开放大镜'"
          @click="focus.toggleMagnifier()"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.progress text {
  display: block;
  margin-bottom: $pindou-space-sm;
  font-size: 13px;
}

.zone-row {
  display: flex;
  gap: $pindou-space-sm;
  margin-bottom: $pindou-space-sm;
}

.zone-tabs {
  white-space: nowrap;
  margin-bottom: $pindou-space-sm;
}

.zone-tab {
  display: inline-block;
  margin-right: $pindou-space-sm;
}

.split-row {
  white-space: nowrap;
}

.palette-row {
  white-space: nowrap;
  margin-bottom: $pindou-space-md;
}

.canvas-scroll {
  max-height: min(68vh, 720px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: $pindou-space-md;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  border: 1px solid $pindou-border-light;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
  padding: 8px 10px;
  border-radius: $pindou-radius-sm;
  border: 1px solid transparent;
  background: $pindou-bg-subtle;
  cursor: pointer;
  transition: border-color $pindou-duration-fast, background $pindou-duration-fast,
    box-shadow $pindou-duration-fast;

  &--active,
  &--outline-active {
    border-color: rgba($pindou-primary, 0.4);
    background: rgba($pindou-primary-light, 0.55);
    box-shadow: $pindou-shadow-sm;
  }
}

.swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin-bottom: $pindou-space-xs;
  position: relative;
}

.badge {
  position: absolute;
  right: -4px;
  top: -6px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: $pindou-radius-pill;
  line-height: 1.2;
}
</style>
