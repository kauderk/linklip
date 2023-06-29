import { pushSame } from '$lib/utils'
import { blockString } from '$v3/integration/notion'
import type { ICongif } from '../types/config'
import { UIDtoURLInstancesMapMap, YTGIF_Config } from '../types/config'

export async function getUrlMap_smart(uid: string) {
  //@ts-expect-error
  return getMap_smart(uid, UIDtoURLInstancesMapMap, getComponentMap, uid, YTGIF_Config)
}
async function getMap_smart<
  M extends Map<string, any>,
  C extends (...args: any) => V,
  V = M extends Map<any, infer I> ? I | Promise<I> : never
>(key: string, map: M, callback: C, ...setMapCb_params: Parameters<C>) {
  if (!key) {
    throw new Error('invalid uid|key while trying to call getComponentMap')
  }
  if (!map.has(key)) {
    // @ts-expect-error
    map.set(key, await callback(...setMapCb_params))
  }
  return map.get(key) as Awaited<V>
}
//TODO:
type position = {
  isKey: isKey
  order: number
  capture: () => any
  index: number
}
type rmObj = position & {
  value: string
  targetStringsWithUids?: Array<rmResObj>
}
type rmResObj = rmObj
class TOrder {
  order = -1
  incrementIf: (x: unknown) => n | null = (condition: unknown) => {
    return condition ? Number(++this.order) : null
  }
}
class IResults {
  'is tooltip card' = new TOrder()
  'is substring' = new TOrder()
  'is component' = new TOrder()
  'is alias' = new TOrder()
  'is block reference' = new TOrder()
}
class IStringWithUIDs {
  targetStringsWithUids = Array<rmResObj>()
  uid: string = ''
}
export async function getComponentMap(tempUID: string, _Config: ICongif) {
  let uidMagazine = Array<string>()
  let indentFunc = 0
  let results = new IResults()

  // componentsInOrderMap
  return TryToFindTargetStrings_Rec(await TryToFindTargetString(tempUID, _Config), new Map())

  async function TryToFindTargetStrings_Rec(objRes: IStringWithUIDs, map: Trm_map) {
    for (const matchObj of objRes?.targetStringsWithUids) {
      const keyObj = assertUniqueKey_while(objRes.uid, indentFunc, matchObj)
      map.set(keyObj, matchObj.value)
    }

    return map
  }
  function assertUniqueKey_while(uid: string, indent: number, pos: position) {
    uidMagazine = PushIfNewEntry(uidMagazine, uid) // clunky, but it works
    const similarCount = uidMagazine.filter(x => x === uid).length // uniqueKey among non siblings
    const isKey = pos.isKey
    return Object.assign(pos, {
      indent,
      uid,
      similarCount,
      isKeyOrder: isCount(),
    })

    function isCount() {
      // FIXME: why does this work? It is changing all the values, right?
      for (const [_is, _val] of Object.entries(results)) {
        _val.incrementIf(_is === isKey)
      }
      return results[isKey].order
    }
  }
}

function PushIfNewEntry<T>(arr: Array<T>, item: T) {
  const lastItem = [...arr]?.pop()
  if (lastItem != item) arr = pushSame(arr, item)
  return arr
}

async function TryToFindTargetString(desiredUID: string, _Config: ICongif) {
  const block = await blockString(desiredUID)

  const siblingsOrder = new IResults()

  // @ts-expect-error
  const targetStringsWithUids: rmResObj[] = block.paragraph.rich_text
    .map((rich, index) => {
      const url = (rich as any).text.link.url
      if (rich.type != 'text' || !YTGIF_Config.targetStringRgx.test(url)) {
        return undefined
      }

      const isKey = 'is substring'
      siblingsOrder[isKey].incrementIf(true)
      return <rmResObj>{
        value: url,
        isKey,
        order: siblingsOrder[isKey].order,
        capture: () => block, // create a reference, not a copy because it's a complex object
        index,
      }
    })
    .filter(Boolean)

  return {
    targetStringsWithUids,
    uid: desiredUID,
  }
}
