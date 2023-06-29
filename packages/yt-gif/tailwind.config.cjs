/** @type {import('tailwindcss').Config} */
const config = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  daisyui: {
    darkTheme: 'black',
    logs: false,
  },
}

module.exports = config
