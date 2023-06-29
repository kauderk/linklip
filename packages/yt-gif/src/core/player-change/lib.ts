import { setCurrentFullscreenPlayer } from '$v3/init/config/yt-gif-init'
import { exitFullscreen, isValidUrl, mapRange, sleep } from '$lib/utils'
import { ClickResetWrapper } from '$v3/lib/event/ClickResetWrapper'
import { ClickOnTimestamp } from '$v3/lib/event/ClickOnTimestamp'
import { ReloadFlow, QueryTimestampObj, newFunction } from './TryToLoadNextTimestampSet'
import { end_loop_sound_volume } from '$v3/components/drop-down-menu/App/miscellaneous/store'

export async function TryToLoadNextTimestampSet(
  iframe: HTMLIFrameElement,
  Reload: () => Promise<void>
) {
  await sleep(10)

  const o = await newFunction(iframe)
  if (!o.rm_container) {
    return Reload()
  }

  const { query, wrapper } = QueryTimestampObj(iframe, o.rm_container)
  const { message, target } = ReloadFlow(query)

  if (message == 'reload-this') {
    return Reload()
  } else if (message == 'update-timestamp') {
    return ClickResetWrapper(wrapper, { message })
  } else if (message == 'seekTo-strict' && target) {
    return ClickOnTimestamp(target, { seekToMessage: message })
  } else {
    console.error('Unknown Reload Message', message)
  }
}

export function TryToPlayEndSound() {
  const url = window.YT_GIF_DIRECT_SETTINGS.get('end_loop_sound_src')?.sessionValue as string
  if (!isValidUrl(url)) return Promise.resolve()

  return new Promise(function (resolve, reject) {
    // return a promise
    const audio = new Audio() // create audio wo/ src
    audio.preload = 'auto' // intend to play through
    audio.volume = mapRange(Number(end_loop_sound_volume.value), 0, 100, 0, 1.0)
    audio.autoplay = true // autoplay when loaded
    audio.onerror = reject // on error, reject
    audio.onended = resolve // when done, resolve

    audio.src = url
  })
}
export function ResetFullscreenPlayer() {
  exitFullscreen()
  setCurrentFullscreenPlayer('')
}
