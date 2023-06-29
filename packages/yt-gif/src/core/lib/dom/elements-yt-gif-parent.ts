import { tm_options } from '$v3/components/drop-down-menu/App/timestamps/store'
import { attrInfo } from '../../init/config/paths'
import { isSelected } from '../backend-frontend/option'
import { properMapIDSuffix } from '../utils'

export { properMapIDSuffix as properBlockIDSufix }

export function closestBlock(el: QrySearch | PossibleBlock | Element) {
  return el ? (el.closest('.notion-text-block') as PossibleBlock) : null
}
export function isRendered(el: QrySearch) {
  return document.body.contains(el!)
}

export function getUidFromBlock(el: QrySearch | PossibleBlock, closest = false) {
  // @ts-expect-error
  let block: PossibleBlock = el
  if (closest) block = closestBlock(el)
  return block?.dataset.blockId
}
export function closest_container_request(el?: Element) {
  if (isSelected(tm_options, 'anchor')) return closest_anchor_container(el!)
  else return closest_container(el!)
}
function closest_anchor_container(el: QrySearch) {
  const anc = (el: QrySearch) => el?.closest('[yt-gif-anchor-container]') ?? null

  const yuid = (el: QrySearch) => el?.getAttribute('yt-gif-anchor-container')

  const buid = (el: QrySearch) => el?.getAttribute('data-yt-gif-block-uid')

  const rm = closest_container(el) as Element
  const yt = anc(el)

  if (buid(rm) == yuid(anc(rm))) return anc(rm)
  return rm || yt
}
function closest_container(el: QrySearch) {
  return el?.closest('.roam-block-container') ?? null
}
export function closestYTGIFparentID(el: QrySearch) {
  return closestBlock(el)?.dataset.blockId
}
export function getWrapperUrlSuffix(wrapper: QrySearch, uid = '') {
  const url = wrapper?.getAttribute(attrInfo.url.path)
  const urlIndex = wrapper?.getAttribute(attrInfo.url.index)
  const urlSufix = properMapIDSuffix(url!, urlIndex!)
  return uid + urlSufix
}
