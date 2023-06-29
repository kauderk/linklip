import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import type { TQueryResult } from '../setup/GetQuery'
import { playIs } from '../lib/IFR'
import { setPlaybackRate } from '$v3/player-ready/listener/toggle'
import type { IFR } from '../types'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'

export function TryToPauseIfBlurred(q: TQueryResult, play: TPlay) {
  const bol = playIs('all_visible')
  play(bol) // pause?

  if (bol && !q.wrapper.Hover() && q.isPlaying()) {
    // if mouse is outside parent and video is playing
    play(false)
  }
}
export function TryToPauseAfterASecond(q: TQueryResult, play: TPlay) {
  setTimeout(() => {
    if (!q.wrapper?.isActive() && !q.wrapper?.Hover()) {
      play(false)
    }
  }, 1000)
}
export function GetAutoplayParent(iframe: IFR) {
  return (
    iframe.closest('.rm-alias-tooltip__content') || //tooltip
    iframe.closest('.bp3-card') || //card
    iframe.closest('.myPortal')
  )
}
export function tryRecycleParameters(api: YT_TargetWrapper, config: IExtendedVideoParams) {
  try {
    api.setVolume(config.volume.value)
    setPlaybackRate(api, config)
  } catch (error) {
    console.log(error)
  }
}
type TPlay = (bol: b) => void
