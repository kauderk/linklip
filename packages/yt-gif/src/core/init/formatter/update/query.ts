import { blockChildren } from '$lib/utils-roam-alpha-api'
import { badPotentialMatches, regexRoam } from '$v3/integration/roam'
import { Wild_Config } from '$v3/lib/types/Wild_Config'
import type { TIndexPair } from '../query/regex'
import type { TBlockInfo } from './types'

export async function TryRecycle(recycledRequest: TBlockInfo[][] | null, tempUid: string) {
  const blockReq = recycledRequest ?? (await blockChildren(tempUid))
  return { info: blockReq?.[0]?.[0], blockReq }
}

export function potentialMatches(
  IndexObj: (rgx: RegExp, type: s) => TIndexPair[],
  toReplace: string
) {
  return IndexObj(stringToRegex(toReplace), 'potentialMatches')
}
/**
 * @example /(string)/gm
 * @returns regex with on capture group, the string escaped
 */
function stringToRegex(string: string) {
  // https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string#:~:text=var%20m%20%3D%20this.match(new%20RegExp(search.toString().replace(/(%3F%3D%5B.%5C%5C%2B*%3F%5B%5E%5C%5D%24()%7B%7D%5C%7C%5D)/g%2C%20%22%5C%5C%22)%2C%20%22g%22))%3B
  return new RegExp(`(${string.replace(/(?=[.\\+*?[^\]$(){}\|])/g, '\\')})`, 'gm')
}

export function TryGetStartEnd(validSubstrings: TIndexPair[], replaceIndex: number) {
  let start, end
  try {
    // I'm making a bet... if there is exactly one valid substring,
    // And the same time if the replaceIndex is out of bounds ... >
    // then I'm going to assume that the one "THING" the user clicked on
    // is unique whitin that particular block.
    if (validSubstrings.length == 1 && !validSubstrings[replaceIndex]) {
      replaceIndex = 0
    }
    start = validSubstrings[replaceIndex].start
    end = validSubstrings[replaceIndex].end
  } catch (error) {
    console.log('yt-gif debugger')
    throw new Error(`YT GIF Formatter: Crashed because of out of bounds target...`)
  }
  return { start, end, replaceIndex }
}
export function isBoundedMatch(BadIndexMatches: TIndexPair[], good: TIndexPair) {
  let specialCase = false
  const badIndex = BadIndexMatches.some(bad => {
    const bounded = good.start >= bad.start && good.end <= bad.end
    specialCase = badPotentialMatches.includes(bad.type)
    return bounded
  })
  if (specialCase) return true
  return !badIndex
}
