import { properBlockIDSufix } from '$v3/lib/dom/elements-yt-gif-parent'
import { YTGIF_Config } from '$v3/lib/types/config'
import { properMapIDSuffix } from '$v3/lib/utils'
import { Flow } from './flow'
import { GetUidResultObj } from './query'

export async function URLResults(el: El) {
  const { key, uidResults } = GetUidResultObj(el)

  if (!key) {
    return null
  }

  const resObj = await Flow(uidResults, key)

  if (!YTGIF_Config.guardClause(resObj?.url)) {
    resObj.url = ''
  }

  const grandParentBlock = uidResults[key].grandParentBlock()

  return <const>{
    uidResult: generateUidResult({
      ...resObj,
      blockID: grandParentBlock?.id + properBlockIDSufix(resObj.url, resObj.accUrlIndex),
    }),
    other: {
      grandParentBlock,
    },
  }
}
export type UIDResult = Omit<
  NonNullable<Awaited<ReturnType<typeof URLResults>>>['uidResult'],
  'nestedComponentMap'
>

export function generateUidResult(preResult: PreResult) {
  const mapID_prefix = preResult.blockID
  const mapID_suffix = properMapIDSuffix(preResult.url, preResult.accUrlIndex)
  return <const>{
    ...preResult,
    entry: {
      mapID: mapID_prefix + mapID_suffix,
      mapID_prefix,
      mapID_suffix,
      accIndex: preResult.accUrlIndex.toString(),
    },
  }
}
type PreResult = {
  blockID: string
  uid: string
  preUrlIndex: number
  accUrlIndex: number
  url: string
}
