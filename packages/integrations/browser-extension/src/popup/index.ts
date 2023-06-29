import './../shared/widgetapi.js'
import './../shared/dependencies.js'
import App from './Popup.svelte'

const app = new App({
  target: document.getElementById('app')!,
})

export default app
