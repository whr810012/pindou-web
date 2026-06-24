<script setup lang="ts">
import { useRouter } from 'vue-router'
import PTag from '@/components/ui/PTag.vue'
import { showToast, request } from '@/utils/platform-ui'
import { onMounted, ref } from 'vue'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { usePageSeo } from '@/utils/seo'

usePageSeo('gallery')

const router = useRouter()

interface GalleryItem {
  id: string
  title: string
  description: string
  tags: string[]
  thumbnail: string
  gridWidth: number
  mode: 'dominant' | 'average'
  palettePresetId: string
}

const items = ref<GalleryItem[]>([])
const project = useProjectStore()
const paletteStore = usePaletteStore()

onMounted(async () => {
  await paletteStore.loadPalettes()
  const data = await fetchGallery()
  items.value = data.items
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

function applyPreset(item: GalleryItem) {
  project.setParams({
    gridWidth: item.gridWidth,
    mode: item.mode,
    palettePresetId: item.palettePresetId,
  })
  paletteStore.setPreset(item.palettePresetId)
  project.projectName = item.title
  showToast({ title: '已应用推荐参数', icon: 'success' })
  setTimeout(() => {
    router.push('/workspace')
  }, 400)
}
</script>

<template>
  <div class="page">
    <div class="intro card">
      <span class="intro-title">拼豆图案例与参数推荐</span>
      <span class="intro-desc">浏览像素拼豆作品案例与推荐生成参数，支持 MARD、COCO 等色卡预设，一键应用到工作台开始创作。</span>
    </div>

    <div v-for="item in items" :key="item.id" class="card item" @click="applyPreset(item)">
      <img class="thumb" :src="item.thumbnail" :alt="`${item.title}拼豆图案例`"  />
      <div class="info">
        <span class="title">{{ item.title }}</span>
        <span class="desc">{{ item.description }}</span>
        <div class="tags">
          <PTag v-for="tag in item.tags" :key="tag" :text="tag" size="mini" plain />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.intro-title {
  display: block;
  font-size: $pindou-font-xl;
  font-weight: 600;
}

.intro-desc {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: $pindou-text-secondary;
}

.item {
  display: flex;
  gap: $pindou-space-md;
}

.thumb {
  width: 80px;
  height: 80px;
  border-radius: $pindou-radius-sm;
  background: $pindou-bg-muted;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.title {
  display: block;
  font-weight: 600;
  font-size: 15px;
}

.desc {
  display: block;
  margin-top: $pindou-space-xs;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: $pindou-space-sm;
}
</style>
