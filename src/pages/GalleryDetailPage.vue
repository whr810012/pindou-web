<script setup lang="ts">
import { useRoute } from 'vue-router'
import GalleryPage from './GalleryPage.vue'
import { usePageSeo } from '@/utils/seo'

usePageSeo('gallery')
const route = useRoute()
</script>

<template>
  <GalleryPage :slug="String(route.params.slug ?? '')" />
</template>
