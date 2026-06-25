import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const appSharedSrc = fileURLToPath(new URL('./packages/app-shared/src', import.meta.url))
const beadCoreSrc = fileURLToPath(new URL('./packages/bead-core/src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    extensions: ['.mjs', '.mts', '.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pindou/app-shared': appSharedSrc,
      '@pindou/bead-core': beadCoreSrc,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/tokens.scss" as *;\n`,
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
