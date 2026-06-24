<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import { showToast, showModal } from '@/utils/platform-ui'
import ProjectThumbnail from '@/components/ProjectThumbnail.vue'
import type { SavedProject } from '@/types/app'
import { ProjectStorage } from '@/utils/projectStorage'
import { gridMeta } from '@/utils/thumbnail'
import { useFocusStore } from '@/stores/focus'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { usePageSeo } from '@/utils/seo'

const router = useRouter()
usePageSeo('projects')

const projects = ref<SavedProject[]>([])
const project = useProjectStore()
const focus = useFocusStore()
const paletteStore = usePaletteStore()

function refresh() {
  projects.value = ProjectStorage.list()
}

onMounted(refresh)

function openItem(item: SavedProject) {
  project.loadSnapshot({
    grid: item.grid,
    params: item.params,
    excludedPaletteIds: item.excludedPaletteIds,
    projectName: item.name,
    sourcePreview: item.sourcePreview,
    savedProjectId: item.id,
  })
  paletteStore.setPreset(item.params.palettePresetId)
  paletteStore.setBrand(item.params.brand)
  focus.loadCompleted(item.completedCells ?? [])
  router.push('/workspace')
}

function removeItem(id: string) {
  showModal({
    title: '删除项目',
    content: '确定删除此项目？',
    success: (res) => {
      if (!res.confirm) return
      ProjectStorage.remove(id)
      refresh()
    },
  })
}

function renameItem(item: SavedProject) {
  showModal({
    title: '重命名',
    editable: true,
    placeholderText: item.name,
    content: item.name,
    success: (res) => {
      if (!res.confirm) return
      const name = res.content?.trim() || item.name
      ProjectStorage.rename(item.id, name)
      refresh()
    },
  })
}

function duplicateItem(id: string) {
  ProjectStorage.duplicate(id)
  refresh()
  showToast({ title: '已复制', icon: 'success' })
}

function itemMeta(item: SavedProject) {
  return gridMeta(item.grid)
}
</script>

<template>
  <div class="page">
    <div v-if="!projects.length" class="empty-state">暂无保存的项目</div>
    <div v-for="item in projects" :key="item.id" class="card project-card" @click="openItem(item)">
      <ProjectThumbnail :grid="item.grid" :size="56" />
      <div class="meta">
        <span class="name">{{ item.name }}</span>
        <span class="spec">
          {{ itemMeta(item).cols }}×{{ itemMeta(item).rows }} · {{ itemMeta(item).colorCount }} 色
        </span>
        <span class="time">{{ new Date(item.updatedAt).toLocaleString() }}</span>
      </div>
      <div class="actions" @click.stop>
        <PButton size="sm" @click="renameItem(item)">改名</PButton>
        <PButton size="sm" @click="duplicateItem(item.id)">复制</PButton>
        <PButton size="sm" type="text" @click="removeItem(item.id)">删</PButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.meta {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spec {
  display: block;
  margin-top: 2px;
  font-size: $pindou-font-sm;
  color: $pindou-text-secondary;
}

.time {
  display: block;
  margin-top: 2px;
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: $pindou-space-xs;
}

.project-card {
  display: flex;
  gap: $pindou-space-md;
  align-items: center;
}
</style>
