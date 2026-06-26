<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const domain = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined

let scriptEl: HTMLScriptElement | null = null

onMounted(() => {
  if (!domain || typeof document === 'undefined') return
  scriptEl = document.createElement('script')
  scriptEl.defer = true
  scriptEl.dataset.domain = domain
  scriptEl.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(scriptEl)
})

onUnmounted(() => {
  scriptEl?.remove()
  scriptEl = null
})
</script>

<template>
  <span class="site-analytics" aria-hidden="true" />
</template>
