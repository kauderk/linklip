import { lastBlockIDParameters } from '$v3/lib/types/config'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import { setupPreviousParams } from './setupPreviousParams'
import { TryFreezeAutoplay } from '../finished/autoplay-flow'
import type { TQueryResult } from './GetQuery'
import type { UIDResult } from '$v3/api-ready/setup/url-result'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'

export async function Refurbish(
  api: YT_TargetWrapper,
  control: TQueryResult,
  config: IExtendedVideoParams,
  uidResult: UIDResult
) {
  const session = lastBlockIDParameters.get(uidResult.entry.mapID)
  if (session) {
    session.updateTime.set(api.ytgif.previousTick)
  }
  // The YT API reloads the iframe onload
  // it disorients the users, this a counter-measurement
  setupPreviousParams(control, config, uidResult)

  TryFreezeAutoplay(api, control)
  //TryToRunPreviousParams(t, local)
}
