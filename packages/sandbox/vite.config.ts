import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import preprocess from 'svelte-preprocess'
import tsconfigPaths from 'vite-tsconfig-paths'

const libName = 'extension'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), svelte({ preprocess: preprocess() })],
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'src/app/follow.ts',
      formats: ['iife'],
      name: libName,
      fileName: `${libName}.js`,
    },
  },
})
