import { TypedRegEx } from '$lib/regex/typed'
import { div, getUniqueSelectorSmart, toggleAttribute } from '$lib/utils'
import { Wild_Config } from '$v3/lib/types/Wild_Config'
import { attrInfo } from '../init/config/paths'

export function properMapIDSuffix(url: string, urlIndex: number | string) {
  return '_' + [url, urlIndex].join('_')
}
function preRgxComp(rgxPage: string) {
  // {{[[page]]: xxxxxxx }}
  return `{{(\\[\\[)?(${rgxPage})((?=:):|[^:|\\/]+?(:))(?<content>|[^{]+)}}` as const
}
export function componentRgx() {
  return TypedRegEx(preRgxComp(Wild_Config.componentPage), 'gm')
}
export function BlockRegexObj(componentPage = Wild_Config.componentPage, targetStringRgx?: RegExp) {
  const componentRgx = new RegExp(preRgxComp(componentPage), 'gm')
  const anyPossibleComponentsRgx = Wild_Config.targetStringRgx // https://stackoverflow.com/questions/30787438/how-to-stop-match-until-before-a-character-in-regex#:~:text=assisterId%3D-,(%5B%5E%22%5D*),-%5B%5E%22%5D*%20matches%20any%20character
  const aliasPlusUidsRgx = /\[(.*?(?=\]))]\(\(\((.*?(?=\)))\)\)\)/gm
  const tooltipCardRgx = /{{=:(.+?)\|([^}]*)/gm
  const anyUidRgx = /(?<=\(\()([^(].*?[^)])(?=\)\))/gm
  // set in the order in which roam renders them - anyPossibleComponents is kinda like a joker card, it will trap components along with irrelevant uids
  const baseBlockRgx = [
    tooltipCardRgx,
    componentRgx,
    anyPossibleComponentsRgx,
    aliasPlusUidsRgx,
    anyUidRgx,
  ]
  if (targetStringRgx) baseBlockRgx.push(targetStringRgx)
  const blockRgx = reduceRgxArr(baseBlockRgx)

  return <const>{
    blockRgx,
    aliasPlusUidsRgx,
    tooltipCardRgx,
    anyPossibleComponentsRgx,
    componentRgx,
    anyUidRgx,
  }
}
function reduceRgxArr(regexArr: RegExp[]) {
  // https://masteringjs.io/tutorials/fundamentals/concat-regexp
  return regexArr.reduce(
    (accumulator, current, i, a) =>
      new RegExp(
        accumulator.source != '(?:)' ? accumulator.source + '|' + current.source : current.source,
        'gm'
      ),
    // @ts-ignore // TODO:
    new RegExp()
  )
}
export function floatParam(p: string, url: string) {
  const raw = paramRgx(p)?.exec(url)?.[2]

  return raw ? time2sec(raw) : 0
}
export function time2sec(raw: string) {
  if (/[hms]/.test(raw)) {
    const hms = [...raw.matchAll(/\w+h|\w+m|\w+s/g)].map(m => m[0])

    return hms.reduce((acc, crr) => {
      const t = parseInt(crr) || 0

      if (/s/.test(crr)) return t + acc
      if (/m/.test(crr)) return t * 60 + acc
      if (/h/.test(crr)) return t * 3600 + acc

      return acc
    }, 0)
  }

  return parseFloat(raw)
}
export function paramRgx(p: string, f = 'gm') {
  return new RegExp(`((?:${p})=)(([^&]+))`, f)
}
export function CleanAndBrandNewWrapper(
  wrapper_p: Element,
  attr_name = attrInfo.creation.name,
  attr_value = ''
) {
  const targetClass = wrapper_p.getAttribute(`${attrInfo.target}`) as string
  const parentSel = getUniqueSelectorSmart(wrapper_p.parentNode as Element)

  wrapper_p.parentNode?.removeChild(wrapper_p)
  const el = div([targetClass])
  toggleAttribute(true, attr_name, el, attr_value)
  document.querySelector(parentSel)?.appendChild(el)
  return el
}
