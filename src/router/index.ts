import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'hub', component: () => import('@/pages/HubPage.vue') },
    { path: '/pindou', name: 'pindou-landing', component: () => import('@/pages/LandingPage.vue') },
    { path: '/home', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/workspace', name: 'workspace', component: () => import('@/pages/WorkspacePage.vue') },
    { path: '/editor', name: 'editor', component: () => import('@/pages/EditorPage.vue') },
    { path: '/focus', name: 'focus', component: () => import('@/pages/FocusPage.vue') },
    { path: '/projects', name: 'projects', component: () => import('@/pages/ProjectsPage.vue') },
    { path: '/gallery', name: 'gallery', component: () => import('@/pages/GalleryPage.vue') },
    { path: '/preview3d', name: 'preview3d', component: () => import('@/pages/Preview3dPage.vue') },
    { path: '/palette', name: 'palette', component: () => import('@/pages/PaletteEditorPage.vue') },
    { path: '/text', name: 'pixel-text', component: () => import('@/pages/PixelTextPage.vue') },
    { path: '/guide', name: 'guide', component: () => import('@/pages/GuidePage.vue') },
    { path: '/bead-core', name: 'bead-core', component: () => import('@/pages/BeadCorePage.vue') },
    { path: '/toolbox', name: 'toolbox', component: () => import('@/pages/ToolboxPage.vue') },
    { path: '/gallery/:slug', name: 'gallery-detail', component: () => import('@/pages/GalleryDetailPage.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
