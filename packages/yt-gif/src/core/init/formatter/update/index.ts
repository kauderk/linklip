import { badMatches } from '$v3/integration/roam'
import { indexPairObj } from '../query/regex'
import { TryRecycle, potentialMatches, isBoundedMatch, TryGetStartEnd } from './query'
import type { TBlockInfo } from './types'

export async function TryToUpdateBlockSubString(
  tempUid: s,
  replaceIndex: n,
  toReplace: s,
  recycledRequest: TBlockInfo[][] | null
) {
  const { info, blockReq } = await TryRecycle(recycledRequest, tempUid)

  if (!info || replaceIndex == -1) {
    return <const>{ success: false, open: false }
  }

  const finder = (rgx: RegExp, type: s) => indexPairObj(rgx, info.string, type)

  // 1. gather spots/boundaries where hosts do NOT render information
  const bad = badMatches(finder, toReplace)

  // 2. valid spots where you can insert fmt components - user requests
  const possible = potentialMatches(finder, toReplace)
  const valid = possible.filter(good => isBoundedMatch(bad, good))

  return <const>{
    success: true,
    uid: tempUid,
    ...TryGetStartEnd(valid, replaceIndex),
    open: info.open,
    string: info.string,
    recycledRequest: blockReq,
  }
}
