import { getUrlMap_smart } from '$v3/lib/backend-frontend/get-maps'
import { Value_AtIndexInMap } from '$v3/lib/backend-frontend/map-query'
import type { TAlias, TBase } from './composition'

export async function Flow(
  uidResults: {
    /* a class makes the most sense here, but they're so similar, yet so different, and it only happens once at the time I hope... */
    'is component': TBase
    'is tooltip card': TAlias
    'is alias': TAlias
    'is ddm tutorial': TBase
  },
  key: keyof typeof uidResults
) {
  const resObj = {
    uid: uidResults[key].uid,
    preUrlIndex: uidResults[key].getUrlIndex(),
    accUrlIndex: 0,
    url: uidResults[key].url,
    nestedComponentMap: <Trm_map>{},
  }

  //#region Flow
  if (key == 'is ddm tutorial') {
    resObj.accUrlIndex = resObj.preUrlIndex
    return resObj
  } else if (key == 'is tooltip card') {
    // it is a block in it's own right
    const tempMap = await getUrlMap_smart(uidResults[key].uid)

    // @ts-ignore FIXME: this will never return a Map
    resObj.nestedComponentMap = Value_AtIndexInMap(tempMap, resObj.preUrlIndex, key)
    // https://roamresearch.slack.com/archives/CTAE9JC2K/p1638578496037700
    if (!resObj?.nestedComponentMap || resObj?.nestedComponentMap.size == 0) {
      console.log('yt-gif debugger')
      resObj.nestedComponentMap = [...tempMap.values()][resObj.preUrlIndex] as Trm_map
    }
    if (!resObj?.nestedComponentMap || resObj?.nestedComponentMap.size == 0) {
      return resObj
    }
    updateUrlIndexInsideAlias()
  } else if (key == 'is alias') {
    const tempMap = await getUrlMap_smart(uidResults[key].uid)

    // needs it's own UID                                   // is it's parent's
    resObj.uid = Value_AtIndexInMap(tempMap, resObj.preUrlIndex, key)
    resObj.nestedComponentMap = await getUrlMap_smart(resObj.uid)
    updateUrlIndexInsideAlias()
  } else {
    resObj.nestedComponentMap = await getUrlMap_smart(resObj.uid)
  }
  //#endregion

  resObj.url = Value_AtIndexInMap(resObj.nestedComponentMap, resObj.preUrlIndex, 'is component')
  resObj.accUrlIndex += resObj.preUrlIndex
  return resObj

  function updateUrlIndexInsideAlias() {
    resObj.accUrlIndex += resObj.preUrlIndex
    resObj.preUrlIndex = uidResults[key].getUrlIndex() // it also needs it's own urlIndex
  }
}
