import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import tsconfigPaths from 'vite-tsconfig-paths'

const name = 'LinklipExtension'
const dev = process.env.NODE_ENV !== 'production'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    minify: true,
    lib: {
      entry: 'src/content/index.ts',
      formats: ['umd'],
      name,
      fileName: `${name}.js`,
    },
    rollupOptions: {
      output: {
        dir: 'dist',
        name,
        assetFileNames: assetInfo => {
          if (assetInfo.name == 'style.css') return `${name}.css`
          return `[name].[ext]`
        },
        entryFileNames: `${name}.js`,
        chunkFileNames: `${name}.js`,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    svelte({
      compilerOptions: {
        dev,
      },
      preprocess: sveltePreprocess(),
      emitCss: false,
    }),
  ],
})
