import { ExtractParamsFromUrl } from '$v3/init/formatter/query/extract'
import { allVideoParameters, recordedIDs } from '$v3/lib/types/config'
import { T_YT_RECORD } from '$v3/lib/types/yt-types'

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
