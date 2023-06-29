import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-ignore
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  plugins: [tsconfigPaths(), sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
