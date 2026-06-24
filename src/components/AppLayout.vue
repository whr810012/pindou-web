<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/home', label: '首页', exact: true },
  { path: '/workspace', label: '工作台' },
  { path: '/projects', label: '项目' },
  { path: '/gallery', label: '画廊' },
  { path: '/palette', label: '色板' },
]

const isLanding = computed(() => route.path === '/')

const isWideContent = computed(() => route.path === '/workspace')

const hideNav = computed(() => {
  if (isLanding.value) return true
  const hidden = ['/editor', '/focus', '/preview3d']
  return hidden.some((p) => route.path === p || route.path.startsWith(`${p}/`))
})

function isActive(item: (typeof navItems)[number]) {
  if (item.exact) return route.path === item.path
  return route.path === item.path || route.path.startsWith(`${item.path}/`)
}

function go(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--landing': isLanding }">
    <header v-if="!hideNav" class="app-header">
      <a class="brand" href="/home" @click.prevent="go('/home')">
        <span class="brand__mark" aria-hidden="true">◆</span>
        <span>Pindou 拼豆</span>
      </a>
      <nav class="app-nav" aria-label="主导航">
        <a
          v-for="item in navItems"
          :key="item.path"
          class="nav-link"
          :class="{ active: isActive(item) }"
          :href="item.path"
          @click.prevent="go(item.path)"
        >
          {{ item.label }}
        </a>
      </nav>
    </header>
    <main
      class="app-main"
      :class="{
        'app-main--full': hideNav && !isLanding,
        'app-main--landing': isLanding,
      }"
    >
      <div
        v-if="!isLanding && !hideNav"
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
  background: $pindou-bg-page;
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
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid $pindou-border-light;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: $pindou-text;
  text-decoration: none;
  white-space: nowrap;
}

.brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, $pindou-primary, $pindou-accent);
  color: #fff;
  font-size: 11px;
}

.app-nav {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-link {
  padding: 8px 14px;
  border-radius: $pindou-radius-pill;
  font-size: $pindou-font-sm;
  font-weight: 500;
  color: $pindou-text-muted;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: $pindou-text;
    background: $pindou-bg-muted;
  }

  &.active {
    color: $pindou-primary;
    background: rgba($pindou-primary, 0.1);
    font-weight: 600;
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
