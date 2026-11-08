import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

const h3 = dirname(dirname(createRequire(fileURLToPath(import.meta.resolve('nuxt'))).resolve('h3')))

export default defineConfig({
  plugins: [vue(), AutoImport({ imports: ['vue', '@vueuse/core'], dts: false })],
  resolve: {
    alias: {
      h3,
      '#components': fileURLToPath(new URL('./tests/stubs/components.ts', import.meta.url)),
      '#imports': fileURLToPath(new URL('./tests/stubs/imports.ts', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    globals: true,
  },
})
