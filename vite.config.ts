import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const appSharedSrc = fileURLToPath(new URL('./packages/app-shared/src', import.meta.url))
const beadCoreSrc = fileURLToPath(new URL('./packages/bead-core/src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pindou/app-shared': appSharedSrc,
      '@pindou/bead-core': beadCoreSrc,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/tokens.scss";`,
      },
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
