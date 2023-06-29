import type { KnipConfig } from 'knip'
import sveltePreprocess from 'svelte-preprocess'
import { compile, preprocess } from 'svelte/compiler'

const sveltePreprocessor = sveltePreprocess()

// https://github.com/logos-innovation-lab/Kurate/blob/054bcae77d7fa1cd3cb2b73b5e791fd1b5359a41/packages/ui/knip.ts#L16
const config: KnipConfig = {
  ignore: ['**/*.d.ts', 'src/lib/utils.ts', 'src/lib/missing.ts'],
  paths: {
    // This ain't pretty, but Svelte basically does the same
    '$app/*': ['node_modules/@sveltejs/kit/src/runtime/app/*'],
    '$env/*': ['.svelte-kit/ambient.d.ts'],
    '$lib/*': ['src/lib/*'],
    '$cmp/*': ['src/components/*'],
    '$styles/*': ['src/styles/*'],
    '$stores/*': ['src/stores/*'],
    '$v2/*': ['src/yt-gif/v0.2.0/js/*'],
    '$v3/*': ['src/core/*'],
    '$chm/*': ['src/chrome_extension/*'],
    '$src/*': ['src/*'],
  },
  compilers: {
    svelte: async (text: string) => {
      const processed = await preprocess(text, sveltePreprocessor, { filename: 'dummy.ts' })
      const compiled = compile(processed.code)
      return compiled.js.code
    },
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
  project: ['src/**/*.ts', 'src/**/*.svelte'],
  ignoreDependencies: ['autoprefixer', 'postcss', 'svelte-preprocess'],
}

export default config
