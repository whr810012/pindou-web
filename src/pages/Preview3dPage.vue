<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ThreeBeadViewer from '@/components/ThreeBeadViewer.vue'
import { usePaletteStore } from '@/stores/palette'
import { useProjectStore } from '@/stores/project'
import { usePageSeo } from '@/utils/seo'

usePageSeo('preview3d')

const project = useProjectStore()
const paletteStore = usePaletteStore()
const grid = computed(() => project.grid)
const hasGrid = computed(() => !!grid.value?.length)

onMounted(() => {
  paletteStore.loadPalettes()
})
</script>

<template>
  <div class="page">
    <div v-if="!hasGrid" class="empty-state">请先在工作台生成图纸后再预览 3D 效果</div>
    <template v-else>
      <div class="card canvas-wrap">
        <ThreeBeadViewer :grid="grid" />
      </div>
      <div class="card tips">
        <span class="tip">拖动旋转 · 滚轮缩放 · 双指操作（移动端）</span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.canvas-wrap {
  padding: 0;
  overflow: hidden;
}

.tip {
  display: block;
  font-size: $pindou-font-sm;
  color: $pindou-text-muted;
  text-align: center;
}
</style>
