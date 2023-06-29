import type { TIndexPair } from '$v3/init/formatter/query/regex'
import { Wild_Config } from '$v3/lib/types/Wild_Config'

export const regexRoam = {
  codeBlocks: /(`.+?`)|(`([\s\S]*?)`)/gm,
  tooltipPrompt: /{{=:(.+?)\|(.+)}}/gm,
}

function filterOutCode(indexObj: TIndexPair[]) {
  const inlindeCodeRgx = regexRoam.codeBlocks
  return [...indexObj].filter(x => !inlindeCodeRgx.test(x.match as s))
}
function promptToBadCode(op: TIndexPair) {
  const y = { ...op }

  y.start = op.start + 4 // 4 = {{=:
  y.end = op.end - (1 + op.groups[2]?.length + 2) // 1 = |     +    [2].length = hiidden content   +    2 = }}
  y.match = op.groups[1] // prompt
  return y
}
export function badMatches(IndexObj: (rgx: RegExp, type: s) => TIndexPair[], toReplace: string) {
  const BadIndexMatches = [
    ...IndexObj(regexRoam.codeBlocks, 'codeBlocks'),
    ...filterOutCode(IndexObj(regexRoam.tooltipPrompt, 'tooltipPrompt')).map(promptToBadCode),
  ]
  const cmptRgx = Wild_Config.targetStringRgx // anyPossibleComponentsRgx

  // 1.1 get out of your own way?
  if (!toReplace.match(cmptRgx)?.[0]) {
    // if it were to be component it would've have filter out itself later on
    BadIndexMatches.push(...IndexObj(cmptRgx, 'components'))
  }
  return BadIndexMatches
}

export const badPotentialMatches = ['tooltipPrompt']
