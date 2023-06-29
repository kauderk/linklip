import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import type { K } from './extract'

export function GetParamFunc<V = number>(key: K, media: IExtendedVideoParams, tm: (str: s) => V) {
  // check yourself and your aliases
  const alias = [key, ...media[key].alias]
  // @ts-ignore
  const init = media[key].value as V

  return alias.reduce((acc, crr) => {
    const val = tm(crr) ?? init
    // valid? then keep it
    return val ? val : acc
  }, init)
}

export function indexPairObj(regex: RegExp, str: string, type: string) {
  // https://www.designcise.com/web/tutorial/how-to-return-the-position-of-a-regular-expression-match-in-javascript#:~:text=matchArr%5B1%5D.length%5D)%3B%0A%7D-,console.log(indexPairs)%3B%20//%20output%3A%20%5B8%2C%2025%5D%2C%20%5B27%2C%2035%5D,-The%20exec()%20method
  const matches = [...str.matchAll(regex)]

  const indexPairs: Array<TIndexPair> = []

  for (const matchArr of matches) {
    const idx = matchArr.index ?? 0 // FIXME: have no idea if this is correct

    indexPairs.push({
      type,
      start: idx,
      end: idx + matchArr[0].length,
      match: matchArr[0],
      groups: matchArr,
    })
  }

  return indexPairs
}
export class TIndexPair {
  type = ''
  start = 0
  end = 0
  match: StrSearch = undefined
  // @ts-ignore
  groups: RegExpMatchArray = []
}
