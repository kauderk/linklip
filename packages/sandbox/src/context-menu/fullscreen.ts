import ContextMenu from './ContextMenu.svelte'

export function createContextMenu() {
  let contextMenu: ContextMenu | undefined = undefined
  function mount(target?: any) {
    contextMenu?.$destroy()
    contextMenu = new ContextMenu({
      target: target ?? document.body,
    })
  }
  function destroy() {
    contextMenu?.$destroy()
    contextMenu = undefined
  }
  mount()
  const onFullscreen = (e: Event) => {
    if (document.fullscreenEnabled) {
      mount(document.fullscreenElement)
    } else {
      mount()
    }
  }
  document.addEventListener('fullscreenchange', onFullscreen)
  return () => {
    document.removeEventListener('fullscreenchange', onFullscreen)
    destroy()
  }
}
