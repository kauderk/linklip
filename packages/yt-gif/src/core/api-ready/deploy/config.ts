import { isTrue } from '$lib/utils'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'

// last - customize the iframe - api
export function playerConfig(configParams: IExtendedVideoParams) {
  // in progress
  const { player_interface_language, player_captions_language, player_captions_on_load } =
    Object.fromEntries(window.YT_GIF_DIRECT_SETTINGS) // https://stackoverflow.com/questions/49569682/destructuring-a-map#:~:text=let%20%7B%20b%2C%20d%20%7D%20%3D%20Object.fromEntries(m)

  const playerVars = {
    autoplay: 1,
    controls: 1,
    mute: 1,
    start: configParams?.start.value,
    end: configParams?.end.value,

    hl: configParams?.hl.value || player_interface_language.sessionValue,
    cc_lang_pref: configParams?.cc.value || player_captions_language.sessionValue,

    cc_load_policy: isTrue(player_captions_on_load.sessionValue as s) ? 1 : 3,
    iv_load_policy: 3,

    vq: 'hd1080',

    autohide: 1,
    showinfo: 0,
    modestbranding: 1,

    fs: 1,
    rel: 0,

    version: 3,
    feature: 'oembed',
    enablejsapi: 1,
    origin: typeof window !== 'undefined' ? window.location.origin : undefined,
  }
  return <const>{
    height: '100%',
    width: '100%',
    videoId: configParams?.id.value,
    playerVars,
  }
}
