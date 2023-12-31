import './../shared/dependencies.js'
import App from './Content.svelte'

const div = document.createElement('div')
div.style.setProperty('z-index', '100000')
div.style.setProperty('position', 'fixed')
document.body.insertAdjacentElement('afterbegin', div)
const shadowRoot = div.attachShadow({ mode: 'open' })
let loaded = false
let timeout = setTimeout(() => {
  console.log('timeout')
  const sibling = document.querySelector('.notion-topbar-action-buttons .notion-topbar-share-menu')
  if (!sibling || loaded) {
    return
  }
  clearTimeout(timeout)

  if (!loaded) {
    const app = new App({
      target: div,
    })
  }
  loaded = true
}, 500)

export default {}
