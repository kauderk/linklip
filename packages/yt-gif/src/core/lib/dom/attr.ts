import { toggleAttribute } from '$lib/utils'

export function awaitingAtrr(bol: boolean, el: Element) {
  return toggleAttribute(bol, 'awaiting', el)
}
