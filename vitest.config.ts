import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['server/**/*.test.ts', 'packages/app-shared/src/**/*.test.ts'],
  },
})
