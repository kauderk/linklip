import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-ignore
import { resolve } from 'path'
import { qwikVite } from '@builder.io/qwik/optimizer'

const name = 'LinklipExtension'
const dev = process.env.NODE_ENV !== 'production'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'src/content/root.ts',
      formats: ['es'],
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
    qwikVite({
      srcDir: resolve('./src'),
      client: {
        input: './src/content/root.ts',
      },
      ssr: {
        // it won't build if this file is missing
        input: './src/entry.ssr.tsx',
      },
    }),
  ],
})
