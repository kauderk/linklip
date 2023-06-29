import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  tsconfigFile: './tsconfig.json',
  compilerOptions: {
    enableSourcemap: true,
  },
  preprocess: preprocess({
    postcss: true,
    sass: true,
    scss: true,
    sourceMap: true,
  }),
}

export default config
