import { yt_playback_speed } from '$v3/components/drop-down-menu/App/stores/formatter'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'

export function setPlaybackRate(api: YT_TargetWrapper, config: IExtendedVideoParams) {
  const value = yt_playback_speed.value
  const speed = value == 'Default' ? config.speed.value : Number(value)
  config.speed.tick = 1000 / speed
  api.setPlaybackRate(speed)
}
