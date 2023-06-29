import { GetClosestRate } from '$lib/utils'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'

export function normalizeConfigIfNecessary(api: YT_TargetWrapper, config: IExtendedVideoParams) {
  if (config.start.value <= 0) {
    config.start.set(0)
    config.start.setDefault()
  }
  if (config.end.value <= 0) {
    config.end.set(api.getDuration())
    config.end.setDefault()
  }

  config.speed.set(
    GetClosestRate(
      api.getAvailablePlaybackRates(),
      //
      config.speed.value || 1
    )
  )
}
