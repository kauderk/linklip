import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-vercel'

const config = {
  onwarn: (warning, handler) => {
    const { code } = warning
    // I want to use "tree shaking" but @import is for global styles
    // and @use might be bad for performance but is the best I can do
    if (code === 'css-unused-selector' || code.startsWith('a11y-')) {
      return
    }
    handler(warning)
  },
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    adapter: adapter(),
  },
}

export default config
