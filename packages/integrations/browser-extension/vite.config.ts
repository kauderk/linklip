import { crx } from '@crxjs/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-ignore
import manifest from './src/manifest'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const production = mode === 'production'

  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    resolve: {
      alias: {
        $mock: resolve(__dirname, './src/mock'),
      },
    },
    plugins: [
      tsconfigPaths(),
      crx({ manifest }),
      svelte({
        compilerOptions: {
          dev: !production,
        },
        preprocess: sveltePreprocess(),
        emitCss: false,
      }),
    ],
  }
})
