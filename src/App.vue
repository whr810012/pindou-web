<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePaletteStore } from '@pindou/app-shared'
import AppLayout from '@/components/AppLayout.vue'

const paletteStore = usePaletteStore()

onMounted(() => {
  paletteStore.loadPalettes().catch(console.error)
})
</script>
