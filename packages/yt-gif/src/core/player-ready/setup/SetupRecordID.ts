import { allVideoParameters } from '$v3/lib/types/config'
import type { YT_TargetWrapper, T_YT_RECORD } from '$v3/lib/types/yt-types'
import type { TQueryResult } from './GetQuery'

export function assignYtgifMethodsToYTApi(
  apiRecordEntry: T_YT_RECORD | undefined,
  api: YT_TargetWrapper,
  control: TQueryResult
) {
  if (!apiRecordEntry) {
    return
  }
  apiRecordEntry.wTarget = api
  apiRecordEntry.sameBoundaries = function (tg = api) {
    if (!tg) return false

    const key = tg.GetIframeID()
    const { start: startM, end: endM } = allVideoParameters.get(key)!
    const { start, end } = tg.GetPlayerVars()

    return startM.value == start && endM.value == end
  }
  // recording.seekToUpdatedTime = q.seekToUpdatedTime
  apiRecordEntry.isSoundingFine = control.isSoundingFine
  apiRecordEntry.togglePlay = control.togglePlay
  // recording.bounded = function (sec: number) {
  // 	const d = t.getDuration() ?? 0
  // 	return sec >= 0 && sec <= d
  // }
}
