<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PButton from '@/components/ui/PButton.vue'
import PDrawer from '@/components/ui/PDrawer.vue'
import PLineProgress from '@/components/ui/PLineProgress.vue'
import { showToast, showModal, setClipboardData } from '@/utils/platform-ui'
import ProjectThumbnail from '@/components/ProjectThumbnail.vue'
import type { SavedProject } from '@/types/app'
import { ProjectStorage, createProjectId } from '@/utils/projectStorage'
import { gridMeta } from '@/utils/thumbnail'
import { useFocusStore } from '@/stores/focus'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { decodeProjectShare, encodeProjectShare } from '@/utils/projectShare'
import { usePageSeo } from '@/utils/seo'

const router = useRouter()
usePageSeo('projects')

const projects = ref<SavedProject[]>([])
const project = useProjectStore()
const focus = useFocusStore()
const paletteStore = usePaletteStore()
const importVisible = ref(false)
const pasteCode = ref('')

const projectCount = computed(() => projects.value.length)

function refresh() {
  projects.value = ProjectStorage.list()
}

onMounted(refresh)
onActivated(refresh)

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
    content: '确定删除此项目？删除后无法恢复。',
    success: (res) => {
      if (!res.confirm) return
      ProjectStorage.remove(id)
      refresh()
      showToast({ title: '已删除', icon: 'success' })
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
      showToast({ title: '已重命名', icon: 'success' })
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

function focusProgress(item: SavedProject) {
  const done = item.completedCells?.length ?? 0
  if (!done) return null
  const total = itemMeta(item).beads
  if (!total) return null
  return {
    done,
    total,
    percent: Math.min(100, Math.round((done / total) * 100)),
  }
}

function formatUpdatedAt(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function shareItem(item: SavedProject) {
  const code = encodeProjectShare({
    name: item.name,
    params: item.params,
    grid: item.grid,
    excludedPaletteIds: item.excludedPaletteIds,
    completedCells: item.completedCells ?? [],
  })
  setClipboardData({
    data: code,
    success: () => showToast({ title: '已复制分享码', icon: 'success' }),
  })
}

function importFromCode() {
  try {
    const payload = decodeProjectShare(pasteCode.value)
    const id = createProjectId()
    const saved: SavedProject = {
      id,
      name: payload.name,
      updatedAt: Date.now(),
      params: payload.params,
      grid: payload.grid,
      excludedPaletteIds: payload.excludedPaletteIds,
      completedCells: payload.completedCells,
    }
    ProjectStorage.save(saved)
    pasteCode.value = ''
    importVisible.value = false
    refresh()
    showToast({ title: '已导入项目', icon: 'success' })
  } catch (error) {
    showToast({ title: (error as Error).message || '解析失败', icon: 'none' })
  }
}
</script>

<template>
  <div class="page projects-page page-enter">
    <header class="craft-page-head projects-head">
      <div class="projects-head__main">
        <h1 class="craft-page-head__title">我的项目</h1>
        <p class="craft-page-head__sub">
          保存在本机浏览器
          <span v-if="projectCount" class="projects-head__count">· 共 {{ projectCount }} 个</span>
        </p>
      </div>
      <div class="projects-head__actions">
        <PButton size="sm" plain text="导入分享码" @click="importVisible = true" />
        <PButton size="sm" type="primary" text="新建" @click="router.push('/workspace')" />
      </div>
    </header>

    <div v-if="!projects.length" class="projects-empty card craft-intro-card">
      <div class="projects-empty__visual" aria-hidden="true">
        <span class="projects-empty__folder" />
        <span class="projects-empty__bead projects-empty__bead--1" />
        <span class="projects-empty__bead projects-empty__bead--2" />
        <span class="projects-empty__bead projects-empty__bead--3" />
      </div>
      <h2 class="projects-empty__title">还没有保存的项目</h2>
      <p class="projects-empty__hint">在工作台生成图纸后，点「保存」即可出现在这里，随时继续编辑</p>
      <ol class="projects-empty__steps">
        <li>上传图片并生成图纸</li>
        <li>点击底部或顶部「保存」</li>
        <li>在此继续编辑或导出</li>
      </ol>
      <PButton type="primary" text="去工作台开始" @click="router.push('/workspace')" />
    </div>

    <ul v-else class="projects-list" role="list">
      <li v-for="item in projects" :key="item.id">
        <article
          class="card card--interactive project-card"
          tabindex="0"
          role="button"
          :aria-label="`打开项目 ${item.name}`"
          @click="openItem(item)"
          @keydown.enter="openItem(item)"
        >
          <div class="project-card__thumb craft-preview-frame">
            <ProjectThumbnail :grid="item.grid" :size="72" />
          </div>

          <div class="project-card__body">
            <div class="project-card__head">
              <h2 class="project-card__name">{{ item.name }}</h2>
              <time class="project-card__time" :datetime="new Date(item.updatedAt).toISOString()">
                {{ formatUpdatedAt(item.updatedAt) }}
              </time>
            </div>

            <div class="project-card__chips">
              <span class="project-chip">{{ itemMeta(item).cols }}×{{ itemMeta(item).rows }}</span>
              <span class="project-chip">{{ itemMeta(item).colorCount }} 色</span>
              <span class="project-chip">{{ itemMeta(item).beads }} 豆</span>
            </div>

            <div v-if="focusProgress(item)" class="project-card__progress">
              <PLineProgress :percentage="focusProgress(item)!.percent" :height="5" />
              <span class="project-card__progress-label">
                专注进度 {{ focusProgress(item)!.percent }}%
              </span>
            </div>
          </div>

          <span class="project-card__arrow" aria-hidden="true">›</span>

          <div class="project-card__actions" @click.stop>
            <button type="button" class="project-action" @click="shareItem(item)">分享</button>
            <button type="button" class="project-action" @click="renameItem(item)">改名</button>
            <button type="button" class="project-action" @click="duplicateItem(item.id)">复制</button>
            <button type="button" class="project-action project-action--danger" @click="removeItem(item.id)">
              删除
            </button>
          </div>
        </article>
      </li>
    </ul>

    <PDrawer :model-value="importVisible" @update:model-value="(v) => !v && (importVisible = false)">
      <div class="craft-drawer">
        <span class="craft-drawer__title">导入分享码</span>
        <p class="craft-hint">粘贴以 <code>pindou-project-v1:</code> 开头的分享码，解析后保存到本机</p>
        <textarea
          v-model="pasteCode"
          class="craft-textarea import-textarea"
          rows="5"
          placeholder="粘贴分享码…"
        />
        <PButton type="primary" block text="解析并保存" @click="importFromCode" />
      </div>
    </PDrawer>
  </div>
</template>

<style scoped lang="scss">
.projects-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.projects-head__main {
  flex: 1;
  min-width: 0;
}

.projects-head__count {
  color: $pindou-primary;
  font-weight: 600;
}

.projects-head__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.projects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $pindou-space-md;
}

.projects-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px 28px;
}

.projects-empty__visual {
  position: relative;
  width: 88px;
  height: 72px;
  margin-bottom: 20px;
}

.projects-empty__folder {
  position: absolute;
  inset: 8px 0 0;
  border-radius: $pindou-radius-sm;
  background: linear-gradient(145deg, $pindou-primary-light, rgba($pindou-accent-soft, 0.8));
  border: 2px dashed rgba($pindou-primary, 0.28);

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 12px;
    width: 36px;
    height: 14px;
    border-radius: 6px 6px 0 0;
    background: rgba($pindou-primary, 0.15);
    border: 2px dashed rgba($pindou-primary, 0.28);
    border-bottom: none;
  }
}

.projects-empty__bead {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: $pindou-shadow-sm;

  &--1 {
    top: 28px;
    left: 18px;
    background: $pindou-primary;
  }

  &--2 {
    top: 36px;
    left: 38px;
    background: $pindou-accent;
  }

  &--3 {
    top: 24px;
    right: 16px;
    background: lighten($pindou-primary, 12%);
  }
}

.projects-empty__title {
  margin: 0;
  font-family: $pindou-font-display;
  font-size: $pindou-font-lg;
  font-weight: 800;
  color: $pindou-text;
}

.projects-empty__hint {
  margin: 8px 0 0;
  max-width: 300px;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.55;
}

.projects-empty__steps {
  counter-reset: step;
  margin: 16px 0 20px;
  padding: 0;
  list-style: none;
  text-align: left;
  width: 100%;
  max-width: 260px;

  li {
    position: relative;
    padding: 6px 0 6px 28px;
    font-size: $pindou-font-sm;
    color: $pindou-text-secondary;
    line-height: 1.4;

    &::before {
      counter-increment: step;
      content: counter(step);
      position: absolute;
      left: 0;
      top: 6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba($pindou-primary, 0.12);
      color: $pindou-primary;
      font-size: 11px;
      font-weight: 700;
      line-height: 20px;
      text-align: center;
    }
  }
}

.project-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 0 $pindou-space-md;
  align-items: center;
  padding: 14px $pindou-space-lg;
  transition:
    border-color $pindou-duration-fast,
    box-shadow $pindou-duration-normal $pindou-ease-out,
    transform $pindou-duration-normal $pindou-ease-out;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba($pindou-primary, 0.2), $pindou-shadow-md;
  }
}

.project-card__thumb {
  grid-row: 1 / span 2;
  padding: 8px;
  line-height: 0;

  :deep(.thumb-wrap) {
    border-radius: 6px;
    overflow: hidden;
  }
}

.project-card__body {
  grid-column: 2;
  min-width: 0;
}

.project-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.project-card__name {
  margin: 0;
  font-weight: 700;
  font-size: $pindou-font-md;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $pindou-text;
}

.project-card__time {
  flex-shrink: 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-hint;
  font-variant-numeric: tabular-nums;
}

.project-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.project-chip {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.08);
  border: 1px solid rgba($pindou-primary, 0.12);
  font-size: $pindou-font-xs;
  font-weight: 600;
  color: $pindou-text-secondary;
  font-variant-numeric: tabular-nums;
}

.project-card__progress {
  margin-top: 10px;
  max-width: 220px;
}

.project-card__progress-label {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: $pindou-text-hint;
}

.project-card__arrow {
  grid-column: 3;
  grid-row: 1;
  align-self: center;
  font-size: 22px;
  font-weight: 300;
  color: $pindou-text-hint;
  line-height: 1;
  transition: color $pindou-duration-fast, transform $pindou-duration-fast;

  .project-card:hover & {
    color: $pindou-primary;
    transform: translateX(2px);
  }
}

.project-card__actions {
  grid-column: 2 / span 2;
  grid-row: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid $pindou-border-light;
}

.project-action {
  border: none;
  background: transparent;
  padding: 5px 10px;
  border-radius: $pindou-radius-pill;
  font-size: $pindou-font-xs;
  font-weight: 600;
  color: $pindou-text-secondary;
  cursor: pointer;
  transition: background $pindou-duration-fast, color $pindou-duration-fast;

  &:hover {
    background: rgba($pindou-primary, 0.08);
    color: $pindou-primary;
  }

  &--danger:hover {
    background: rgba($pindou-warning, 0.1);
    color: $pindou-warning;
  }
}

.import-textarea {
  margin-bottom: 14px;
}

@media (max-width: 520px) {
  .projects-head__actions {
    width: 100%;

    :deep(.p-button) {
      flex: 1;
    }
  }

  .project-card {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto auto;
  }

  .project-card__arrow {
    display: none;
  }

  .project-card__actions {
    grid-column: 1 / -1;
  }
}
</style>
