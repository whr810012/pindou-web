
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { MappedGrid } from '@pindou/bead-core'
import { createBeadScene, type BeadSceneHandle } from '@/utils/threeBeadScene'

const props = defineProps<{
  grid: MappedGrid | null
}>()

const hostRef = ref<HTMLDivElement | null>(null)
let sceneHandle: BeadSceneHandle | null = null

function mountScene() {
  sceneHandle?.dispose()
  sceneHandle = null
  if (!hostRef.value || !props.grid?.length) return
  sceneHandle = createBeadScene(hostRef.value, props.grid)
}

onMounted(() => {
  mountScene()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  sceneHandle?.dispose()
})

watch(() => props.grid, mountScene, { deep: true })

function onResize() {
  sceneHandle?.resize()
}
</script>

<template>
  <div ref="hostRef" class="three-host" />
</template>

<style scoped>
.three-host {
  width: 100%;
  height: 360px;
  border-radius: 12px;
  overflow: hidden;
}
</style>

