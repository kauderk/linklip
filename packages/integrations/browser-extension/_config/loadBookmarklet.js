javascript: (async () => {
  const LoadScript = async (src = '') => {
    const id = 'liveServerExtension'
    if (document.querySelector(`[id='${id}']`)) {
      window.location.reload()
      return
    }
    const script = document.createElement('script')
    script.src = src + '?' + new Date().getTime()
    script.id = id
    script.async = false
    script.type = 'module'
    document.getElementsByTagName('head')[0].appendChild(script)
    return new Promise(resolve => script.addEventListener('load', () => resolve(script)))
  }
  LoadScript(
    'https://127.0.0.1:5500/packages/integrations/browser-extension/dist/LinklipExtension.js'
  )
    .then(args => {})
    .catch(args => {
      debugger
    })
})()
