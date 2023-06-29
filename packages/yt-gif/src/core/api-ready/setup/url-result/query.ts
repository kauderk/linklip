import { SrrGlobal } from '$lib/global/SrrGlobal'
import { ObjectKeys } from '$lib/utils'
import { attrInfo } from '$v3/init/config/paths'
import { ElementsPerBlock } from '$v3/lib/dom/ytgif'
import type { TAlias, TBase } from './composition'
import {
  SubUrlObj,
  aliasCondition,
  aliasSel,
  condition,
  grandParentBlock,
  grandParentBlockFromAlias,
  openAlias,
} from './composition'

export function GetUidResultObj(el: Element) {
  const uidResults = {
    'is component': GetIsComponent(el),
    'is tooltip card': GetIsTooltipCard(el),
    'is alias': GetIsAlias(el),
    'is ddm tutorial': GetIsDmmTutorial(el),
  }
  Object.values(uidResults).forEach(obj => Object.assign(obj, SubUrlObj))
  Object.assign(uidResults['is component'], {
    urlComponents: function (this: TBase) {
      // prettier-ignore
      return ElementsPerBlock(this.grandParentBlock(), this.targetSelector)
    },
  })

  return <const>{
    key: ObjectKeys(uidResults).find(x => uidResults[x].condition()),
    uidResults,
  }
}

function GetPreSelector() {
  return [
    [...SrrGlobal.AvoidCircularDependency.getCurrentClassesToObserver()].map(s => '.' + s),
    '.yt-gif-wrapper',
  ]
    .flat(Infinity)
    .filter(s => !!s) as s[]
}
function GetIsDmmTutorial(el: Element) {
  return (<const>{
    uid: 'irrelevant-uid',
    url: '',
    el,
    targetSelector: ['[data-video-url]'].join(),

    condition: function () {
      return (this.url = this.el?.getAttribute(attrInfo.url.path) || '')
    },
    grandParentBlock: function () {
      return this.el?.closest('.dropdown-content')
    },
  }) as TBase
}
function GetIsAlias(el: El) {
  return (<const>{
    uid: '',
    url: '',
    el: openAlias(aliasSel.inline.is),

    targetSelector: [aliasSel.inline.is].join(),

    from: aliasSel.inline.from,
    grandParentBlock: grandParentBlockFromAlias,
    uidCondition: condition,
    condition: aliasCondition(el),
  }) as TAlias
}
function GetIsTooltipCard(el: El) {
  return (<const>{
    uid: '',
    url: '',
    el: openAlias(aliasSel.card.is),

    targetSelector: [aliasSel.card.is].join(),

    from: aliasSel.card.from,
    grandParentBlock: grandParentBlockFromAlias,
    uidCondition: condition,
    condition: aliasCondition(el),
  }) as TAlias
}
function GetIsComponent(el: Element) {
  return (<const>{
    uid: '',
    url: '',
    targetSelector: GetPreSelector().join(),
    el,

    condition,
    grandParentBlock,
    ...SubUrlObj,
  }) as TBase
}
