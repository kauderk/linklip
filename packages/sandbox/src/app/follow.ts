import App from './+layout.svelte'

const app = new App({
  target: document.body.appendChild(document.createElement('div')),
})

export default app
