import { getUidFromBlock, closestBlock } from '$v3/lib/dom/elements-yt-gif-parent'

export const aliasSel = {
  inline: {
    is: 'a.rm-alias.rm-alias--block',
    from: '.rm-alias-tooltip__content',
  },
  card: {
    is: '.rm-block__part--equals',
    from: '.bp3-card',
  },
}
export const openAlias = function (isSel: s) {
  return document.querySelector(`.bp3-popover-open > ${isSel}`)
}
export const aliasCondition = function (originalEl: Element) {
  return function condition(this: TAlias) {
    // prettier-ignore
    const PopOverParent = originalEl.closest(`div.bp3-popover-content > ${this.from}`);
    return PopOverParent && this.uidCondition()
  }
}
export const grandParentBlockFromAlias = function (this: TAlias) {
  const clientPopover = this.el?.closest('.bp3-popover-open')
  if (clientPopover) return closestBlock(clientPopover)
}
export const grandParentBlock = function (this: TBase) {
  return closestBlock(this.el)
}
export const condition = function (this: TBase) {
  return (this.uid = getUidFromBlock(this.grandParentBlock()))
}
export const SubUrlObj = {
  urlComponents: function (this: TBase) {
    return [...Array.from(this.grandParentBlock()?.querySelectorAll(this.targetSelector) ?? [])]
  },
  getUrlIndex: function (this: TBase) {
    return this.urlComponents().indexOf(this.el)
  },
}
export interface TBase {
  uid: string
  url: string
  el: Element | null
  targetSelector: string
  grandParentBlock: () => HTMLElement | undefined
  urlComponents: () => (Element | null)[]
  condition: () => string
  getUrlIndex: () => number
}
export type TAlias = TBase & {
  from: string
  uidCondition: () => string
}
