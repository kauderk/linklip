import { createListeners } from '$lib/event-life-cycle'
import { createSvelteSignal } from '$lib/solid'
import { cleanSubscribers } from '$lib/stores'

export const createFullScreenController = (props: { videoContainer: HTMLElement }) => {
  const fullScreen = createSvelteSignal(false)
  function off() {
    if (document.fullscreenElement) return
    fullScreen.value = false
  }
  function toggle() {
    if (document.fullscreenElement == null) {
      props.videoContainer.requestFullscreen().finally(() => (fullScreen.value = true))
    } else {
      document.exitFullscreen().finally(() => (fullScreen.value = false))
    }
  }
  return {
    fullScreen: Object.assign(fullScreen, { toggle, off }),
    mount: () =>
      cleanSubscribers(
        createListeners(document.body, {
          fullscreenchange: off,
          fullscreenerror: off,
        }),
        () =>
          Object.assign(fullScreen, {
            toggle: undefined,
            off: undefined,
          })
      ),
  }
}
