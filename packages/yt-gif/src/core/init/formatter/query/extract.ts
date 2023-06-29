import { componentRgx, time2sec } from '../../../lib/utils'
import { rgx2Gm } from '../../../lib/helpers'
import { YTGIF_Config } from '../../../lib/types/config'
import { getYouTubeVideoID } from '$lib/utils'
import { IExtendedVideoParams } from '$v3/lib/types/video-types'
import { TIndexPair, indexPairObj, GetParamFunc } from './regex'

/* ******** */

export function ExtractContentFromCmpt(capture: s) {
  return componentRgx().match(capture).groups?.content || capture
}
export function ExtractUrlsObj(searchThrough: s): TIndexPair {
  const { targetStringRgx: urlRgx, minimalRgx } = YTGIF_Config

  if (!searchThrough) return new TIndexPair()

  return (
    indexPairObj(rgx2Gm(urlRgx), searchThrough, 'url')?.[0] ||
    indexPairObj(rgx2Gm(minimalRgx), searchThrough, 'minimal')?.[0] ||
    new TIndexPair()
  )
}
export type K = keyof IExtendedVideoParams
export function ExtractParamsFromUrl(url: s) {
  const media = new IExtendedVideoParams()
  const matches: { [key: string]: string } = {}

  if (YTGIF_Config.guardClause(url)) {
    for (const pair of [...url.matchAll(/(\w+)=([^&]+)/gm)]) {
      matches[pair[1]] = pair[2]
    }

    media.id.set(getYouTubeVideoID(url))
    media.src.set(url)

    media.start.setDefault(GetStartEndParam('start'))
    media.end.setDefault(GetStartEndParam('end'))
    media.volume.set(GetNumParam('volume'))
    media.speed.setDefault(GetNumParam('speed'))

    media.hl.set(GetStrParam('hl'))
    media.cc.set(GetStrParam('cc'))
    media.sp.set(GetStrParam('sp'))

    return media
  }
  return <IExtendedVideoParams>{} // TODO: used to return null, don't know if this brakes anything

  function GetStartEndParam(key: K) {
    return GetParamFunc(key, media, (str: s) => time2sec(matches[str]))
  }
  function GetNumParam(key: K) {
    return GetParamFunc(key, media, (str: s) => parseFloat(matches[str]))
  }
  function GetStrParam(key: K) {
    return GetParamFunc(key, media, (str: s) => matches[str])
  }
}
