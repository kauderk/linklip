import { lastBlockIDParameters } from '$v3/lib/types/config'
import type { IExtendedVideoParams, TVideoParams } from '$v3/lib/types/video-types'
import type { TQueryResult } from './GetQuery'
import type { UIDResult } from '$v3/api-ready/setup/url-result'
import { url_boundaries, url_volume } from '$v3/components/drop-down-menu/App/player-settings/store'

//#region 1. previous parameters
export function setupPreviousParams(
  control: TQueryResult,
  config: IExtendedVideoParams,
  uidResult: UIDResult
) {
  const session = lastBlockIDParameters.get(uidResult.entry.mapID)
  if (!session) {
    return
  }

  // TODO: add noun types: strict | soft
  // prettier-ignore
  const start = GetPreviousStart(session, url_boundaries.value, config.start.value, control.isBounded);
  if (start != undefined) {
    control.seekToUpdatedTime(start)
  }

  const volume = GetPreviousVolume(session, url_volume.value, config.volume.value)
  if (volume != undefined) {
    config.volume.value = volume
  }
}
/* ******************* */
function GetPreviousVolume(session: TVideoParams, value: string, entryVal: n) {
  if (value == 'strict') {
    const vl_Hist = session.volume.history

    if (vl_Hist[vl_Hist.length - 1] != entryVal) {
      // new entry is valid ≡ user updated "&vl="
      vl_Hist.push(entryVal)
      return entryVal
    }

    // updateVolume has priority
    else return session.volume.update
  }

  //
  else if (value == 'soft') return session.volume.update
  //if (value == 'start-only')
  //else return getMapVolume()
}
function GetPreviousStart(
  session: TVideoParams,
  value: string,
  entryVal: number,
  isBounded: (x: number) => boolean
) {
  if (value == 'strict') {
    const timeHist = session.timestamps.history

    if (timeHist[timeHist.length - 1] != entryVal) {
      // new entry is valid ≡ user updated "?t="
      timeHist.push(entryVal)
      return entryVal
    }
  }

  //
  else if (value == 'soft' && isBounded(session.updateTime.value)) {
    return session.updateTime.value
  }
}
