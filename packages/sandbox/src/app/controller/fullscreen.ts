import { createListeners } from '$lib/event-life-cycle'
import { createSvelteSignal, onMount } from '$lib/solid'
import { cleanSubscribers } from '$lib/stores'

export const createFullScreenController = (props: { videoContainer: HTMLElement }) => {
  const fullScreen = Object.assign(createSvelteSignal(false), { toggle, off })
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
  onMount(() =>
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
    )
  )
  return fullScreen
}
