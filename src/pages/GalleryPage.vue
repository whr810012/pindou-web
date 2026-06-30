<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PTag from '@/components/ui/PTag.vue'
import { showToast, request } from '@/utils/platform-ui'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { usePageSeo } from '@/utils/seo'
import {
  applySuggestedParamsForImage,
  loadImageToProject,
  processCurrentProject,
} from '@/utils/pipeline'
import { createSourcePreview } from '@/utils/thumbnail'

usePageSeo('gallery')

const router = useRouter()

import type { MappedGrid } from '@wangdandan810012/bead-core'
import type { ProjectParams } from '@/types/app'

interface GalleryItem {
  id: string
  title: string
  description: string
  tags: string[]
  thumbnail: string
  gridWidth: number
  mode: 'dominant' | 'average'
  palettePresetId: string
  projectFile?: string
}

interface GalleryProjectPayload {
  version: number
  name: string
  params: ProjectParams
  grid: MappedGrid
  excludedPaletteIds: string[]
  completedCells: string[]
  sourcePreview?: string
}

interface TemplateItem {
  id: string
  title: string
  thumbnail: string
  image: string
}

const activeTab = ref<'presets' | 'templates'>('presets')
const items = ref<GalleryItem[]>([])
const templates = ref<TemplateItem[]>([])
const loading = ref(true)
const loadingTemplate = ref(false)
const loadingProjectId = ref<string | null>(null)
const project = useProjectStore()
const paletteStore = usePaletteStore()

const presetCount = computed(() => items.value.length)
const templateCount = computed(() => templates.value.length)

onMounted(async () => {
  await paletteStore.loadPalettes()
  try {
    const [galleryData, templateData] = await Promise.all([fetchGallery(), fetchTemplates()])
    items.value = galleryData.items
    templates.value = templateData.items
  } catch (error) {
    console.error(error)
    showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function fetchGallery(): Promise<{ items: GalleryItem[] }> {
  return new Promise((resolve, reject) => {
    request({
      url: '/static/gallery/gallery.json',
      success: (res) => resolve(res.data as { items: GalleryItem[] }),
      fail: reject,
    })
  })
}

function fetchTemplates(): Promise<{ items: TemplateItem[] }> {
  return new Promise((resolve, reject) => {
    request({
      url: '/static/templates/templates.json',
      success: (res) => resolve(res.data as { items: TemplateItem[] }),
      fail: reject,
    })
  })
}

function modeLabel(mode: GalleryItem['mode']) {
  return mode === 'average' ? '平均�? : '主导�?
}

function paletteLabel(presetId: string) {
  if (presetId.includes('96')) return '96 �?
  if (presetId.includes('168')) return '168 �?
  if (presetId.includes('full')) return '全色�?
  return presetId.replace('pindou-', '')
}

function applyPreset(item: GalleryItem) {
  project.setParams({
    gridWidth: item.gridWidth,
    mode: item.mode,
    palettePresetId: item.palettePresetId,
  })
  paletteStore.setPreset(item.palettePresetId)
  project.projectName = item.title
  showToast({ title: '已应用推荐参�?, icon: 'success' })
  setTimeout(() => {
    router.push('/workspace')
  }, 400)
}

function fetchProjectFile(url: string): Promise<GalleryProjectPayload> {
  return new Promise((resolve, reject) => {
    request({
      url,
      success: (res) => resolve(res.data as GalleryProjectPayload),
      fail: reject,
    })
  })
}

async function openFullProject(item: GalleryItem) {
  if (!item.projectFile || loadingProjectId.value) return
  loadingProjectId.value = item.id
  try {
    const data = await fetchProjectFile(item.projectFile)
    paletteStore.setPreset(data.params.palettePresetId)
    project.loadSnapshot({
      grid: data.grid,
      params: data.params,
      excludedPaletteIds: data.excludedPaletteIds ?? [],
      projectName: data.name || item.title,
      sourcePreview: data.sourcePreview ?? item.thumbnail,
    })
    showToast({ title: '案例已加载，可直接编�?, icon: 'success' })
    router.push('/workspace')
  } catch (error) {
    console.error(error)
    showToast({ title: '加载完整案例失败', icon: 'none' })
  } finally {
    loadingProjectId.value = null
  }
}

function onPresetCardClick(item: GalleryItem) {
  if (item.projectFile) {
    openFullProject(item)
  } else {
    applyPreset(item)
  }
}

async function useTemplate(item: TemplateItem) {
  if (loadingTemplate.value) return
  loadingTemplate.value = true
  try {
    const loaded = await loadImageToProject(item.image)
    applySuggestedParamsForImage(loaded.width, loaded.height, loaded.pixels)
    paletteStore.setPreset(project.params.palettePresetId)
    project.projectName = item.title
    const preview = await createSourcePreview(item.image)
    project.setSourcePreview(preview)
    await processCurrentProject()
    showToast({ title: '模板已加�?, icon: 'success' })
    router.push('/workspace')
  } catch (error) {
    console.error(error)
    showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loadingTemplate.value = false
  }
}
</script>

<template>
  <div class="page gallery-page page-enter">
    <header class="craft-page-head">
      <h1 class="craft-page-head__title">拼豆图案例与素材</h1>
      <p class="craft-page-head__sub">
        浏览参数推荐案例，或选用模板素材一键进入工作台生成图纸�?      </p>
    </header>

    <div class="craft-tabs gallery-tabs">
      <button
        type="button"
        class="craft-tab"
        :class="{ active: activeTab === 'presets' }"
        @click="activeTab = 'presets'"
      >
        参数案例
        <span v-if="presetCount" class="gallery-tabs__count">{{ presetCount }}</span>
      </button>
      <button
        type="button"
        class="craft-tab"
        :class="{ active: activeTab === 'templates' }"
        @click="activeTab = 'templates'"
      >
        模板素材
        <span v-if="templateCount" class="gallery-tabs__count">{{ templateCount }}</span>
      </button>
    </div>

    <div v-if="loading" class="gallery-loading card craft-intro-card">
      <div class="gallery-loading__spinner" aria-hidden="true" />
      <span>加载案例中�?/span>
    </div>

    <template v-else-if="activeTab === 'presets'">
      <ul v-if="items.length" class="gallery-list" role="list">
        <li v-for="item in items" :key="item.id">
          <article
            class="card card--interactive gallery-card"
            :class="{ 'gallery-card--busy': loadingProjectId === item.id }"
            tabindex="0"
            role="button"
            :aria-label="item.projectFile ? `打开完整案例 ${item.title}` : `应用案例 ${item.title}`"
            @click="onPresetCardClick(item)"
            @keydown.enter="onPresetCardClick(item)"
          >
            <div class="gallery-card__thumb craft-preview-frame">
              <img :src="item.thumbnail" :alt="`${item.title}拼豆图案例`" loading="lazy" />
            </div>
            <div class="gallery-card__body">
              <h2 class="gallery-card__title">{{ item.title }}</h2>
              <p class="gallery-card__desc">{{ item.description }}</p>
              <div class="gallery-card__params">
                <span class="gallery-chip">{{ item.gridWidth }} �?/span>
                <span class="gallery-chip">{{ modeLabel(item.mode) }}</span>
                <span class="gallery-chip">{{ paletteLabel(item.palettePresetId) }}</span>
              </div>
              <div v-if="item.tags.length" class="gallery-card__tags">
                <PTag v-for="tag in item.tags" :key="tag" :text="tag" plain />
              </div>
              <div v-if="item.projectFile" class="gallery-card__actions" @click.stop>
                <span class="gallery-card__badge">可编辑案�?/span>
                <button type="button" class="gallery-card__link" @click="applyPreset(item)">
                  仅应用参�?                </button>
              </div>
            </div>
            <span class="gallery-card__arrow" aria-hidden="true">�?/span>
          </article>
        </li>
      </ul>
      <div v-else class="gallery-empty card craft-intro-card">
        <p>暂无案例数据</p>
      </div>
    </template>

    <template v-else>
      <ul v-if="templates.length" class="gallery-list gallery-list--templates" role="list">
        <li v-for="item in templates" :key="item.id">
          <article
            class="card card--interactive gallery-card gallery-card--template"
            :class="{ 'gallery-card--busy': loadingTemplate }"
            tabindex="0"
            role="button"
            :aria-label="`加载模板 ${item.title}`"
            @click="useTemplate(item)"
            @keydown.enter="useTemplate(item)"
          >
            <div class="gallery-card__thumb craft-preview-frame">
              <img :src="item.thumbnail" :alt="item.title" loading="lazy" />
            </div>
            <div class="gallery-card__body">
              <h2 class="gallery-card__title">{{ item.title }}</h2>
              <p class="gallery-card__desc">点击加载模板并自动生成图�?/p>
              <span class="gallery-card__cta">一键生�?�?/span>
            </div>
          </article>
        </li>
      </ul>
      <div v-else class="gallery-empty card craft-intro-card">
        <p>暂无模板素材</p>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.gallery-tabs__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.12);
  color: $pindou-primary;
  font-size: 10px;
  font-weight: 700;

  .craft-tab.active & {
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
  }
}

.gallery-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
}

.gallery-loading__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid $pindou-border-light;
  border-top-color: $pindou-primary;
  border-radius: 50%;
  animation: gallery-spin 0.7s linear infinite;
}

@keyframes gallery-spin {
  to {
    transform: rotate(360deg);
  }
}

.gallery-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $pindou-space-md;
}

.gallery-list--templates {
  @media (min-width: 560px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $pindou-space-md;
  }
}

.gallery-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: $pindou-space-md;
  align-items: center;
  padding: 14px $pindou-space-lg;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba($pindou-primary, 0.2), $pindou-shadow-md;
  }

  &--template {
    grid-template-columns: auto 1fr;
  }

  &--busy {
    opacity: 0.6;
    pointer-events: none;
  }
}

.gallery-card__thumb {
  padding: 8px;
  line-height: 0;
  flex-shrink: 0;

  img {
    width: 76px;
    height: 76px;
    object-fit: cover;
    border-radius: 6px;
    display: block;
    background: $pindou-bg-muted;
  }
}

.gallery-card__body {
  min-width: 0;
}

.gallery-card__title {
  margin: 0;
  font-weight: 700;
  font-size: $pindou-font-md;
  color: $pindou-text;
  line-height: 1.3;
}

.gallery-card__desc {
  margin: 6px 0 0;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  line-height: 1.5;
}

.gallery-card__params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.gallery-chip {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-primary, 0.08);
  border: 1px solid rgba($pindou-primary, 0.12);
  font-size: $pindou-font-xs;
  font-weight: 600;
  color: $pindou-text-secondary;
}

.gallery-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.gallery-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.gallery-card__badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: $pindou-radius-pill;
  background: rgba($pindou-accent, 0.12);
  color: $pindou-accent;
  font-size: 10px;
  font-weight: 700;
}

.gallery-card__link {
  border: none;
  background: none;
  padding: 0;
  font-size: $pindou-font-xs;
  color: $pindou-text-muted;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: $pindou-primary;
  }
}

.gallery-card__cta {
  display: inline-block;
  margin-top: 10px;
  font-size: $pindou-font-xs;
  font-weight: 700;
  color: $pindou-primary;
}

.gallery-card__arrow {
  font-size: 22px;
  font-weight: 300;
  color: $pindou-text-hint;
  line-height: 1;
  transition: color $pindou-duration-fast, transform $pindou-duration-fast;

  .gallery-card:hover & {
    color: $pindou-primary;
    transform: translateX(2px);
  }
}

.gallery-empty {
  padding: 32px 20px;
  text-align: center;
  color: $pindou-text-muted;
  font-size: $pindou-font-sm;
}

@media (max-width: 520px) {
  .gallery-card {
    grid-template-columns: auto 1fr;

    &__arrow {
      display: none;
    }
  }
}
</style>
