const files = '/**/*.{html,js,svelte,ts}'
/** @type {import('tailwindcss').Config} */
const config = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src' + files, '../../yt-gif/src' + files, './../../sandbox/src' + files],
  daisyui: {
    darkTheme: 'black',
    logs: false,
  },
}

module.exports = config
