import { ExtractParamsFromUrl } from '$v3/init/formatter/query/extract'
import { UIDtoURLInstancesMapMap, allVideoParameters, recordedIDs } from '$v3/lib/types/config'
import { T_YT_RECORD } from '$v3/lib/types/yt-types'
import type { UIDResult } from './url-result'

export function CreateRecordID(blockID: s) {
  const record = new T_YT_RECORD()

  if (blockID != null) recordedIDs.set(blockID, record)
  return record
}
export function CreateConfigParams(newId: string, url: string) {
  allVideoParameters.set(newId, ExtractParamsFromUrl(url))
  const configParams = allVideoParameters.get(newId)! // I just created it!
  return configParams
}
export function CheckFalsePositive(o: UIDResult & { wrapper: Element | null }) {
  if (!o.url || o.accUrlIndex < 0 || !o.uid) {
    // FIXME: access to global variable
    UIDtoURLInstancesMapMap.delete(o.uid)
    o.wrapper?.setAttribute('invalid-yt-gif', '')
    console.log(
      `YT GIF: Couldn't find yt-gif component number ${o.accUrlIndex + 1} within the block ((${
        o.uid
      }))`
    )
    return true
  }
  return false
}
