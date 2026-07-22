<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'

const route = useRoute()

const navItems = [
  { path: '/home', label: '首页', exact: true },
  { path: '/workspace', label: '工作台', highlight: true },
  { path: '/projects', label: '项目' },
  { path: '/gallery', label: '画廊' },
  { path: '/palette', label: '色板' },
]

const isStandalonePage = computed(() => route.path === '/')
const isWideContent = computed(() => route.path === '/workspace')

const hideNav = computed(() => {
  if (isStandalonePage.value) return true
  const hidden = ['/editor', '/focus', '/preview3d']
  return hidden.some((p) => route.path === p || route.path.startsWith(`${p}/`))
})

function isActive(item: (typeof navItems)[number]) {
  if (item.exact) return route.path === item.path
  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--landing': isStandalonePage }">
    <header v-if="!hideNav" class="app-header">
      <router-link class="brand" to="/">
        <BrandLogo layout="stack" />
      </router-link>
      <nav class="app-nav" aria-label="主导航">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          class="nav-link"
          :class="{ active: isActive(item), 'nav-link--cta': item.highlight }"
          :to="item.path"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </header>
    <main
      class="app-main"
      :class="{
        'app-main--full': hideNav && !isStandalonePage,
        'app-main--landing': isStandalonePage,
      }"
    >
      <div
        v-if="!isStandalonePage && !hideNav"
        class="app-content"
        :class="{ 'app-content--wide': isWideContent }"
      >
        <slot />
      </div>
      <slot v-else />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-shell--landing {
  background: transparent;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 18px;
  background: rgba($pindou-bg-card, 0.88);
  border-bottom: 1px solid $pindou-border;
  backdrop-filter: blur(16px) saturate(1.15);
  box-shadow: 0 1px 0 rgba($pindou-text, 0.04);
}

.brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
}

.app-nav {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 2px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-link {
  position: relative;
  padding: 8px 13px;
  border-radius: $pindou-radius-pill;
  font-size: $pindou-font-sm;
  font-weight: 500;
  color: $pindou-text-muted;
  text-decoration: none;
  white-space: nowrap;
  transition: background $pindou-duration-fast, color $pindou-duration-fast;

  &:hover {
    color: $pindou-text;
    background: rgba($pindou-text, 0.05);
  }

  &.active {
    color: $pindou-primary;
    background: rgba($pindou-primary, 0.1);
    font-weight: 600;
  }

  &--cta:not(.active) {
    color: $pindou-primary;
    border: 1px solid rgba($pindou-primary, 0.2);
    background: rgba($pindou-primary, 0.04);
  }
}

.app-main {
  flex: 1;
  width: 100%;
}

.app-main--full {
  padding-top: 0;
}

.app-main--landing {
  padding: 0;
}

.app-content {
  width: 100%;
  max-width: $pindou-content-max;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-content--wide {
  max-width: $pindou-content-wide;
}
</style>
