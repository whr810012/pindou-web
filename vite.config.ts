import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const appSharedSrc = fileURLToPath(new URL('./packages/app-shared/src', import.meta.url))

export default defineConfig({
  base: '/pindou/',
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'pinia'],
    extensions: ['.mjs', '.mts', '.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pindou/app-shared': appSharedSrc,
      pinia: fileURLToPath(new URL('./node_modules/pinia', import.meta.url)),
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
