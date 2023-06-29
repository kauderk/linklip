import type { Writable } from 'svelte/store'
import { get } from 'svelte/store'

const Detail = {
  open: false,
  anyFocus: false,
  forceOpen: false,
}
type props = { el?: QrySearch; detail: Writable<typeof Detail> }
export function Flow({ el, detail }: props) {
  const hovering = () => el?.matches(':hover')
  const open = (b: b) => {
    detail.update(o => ({ ...o, open: b }))
  }

  const tryClose = (focus?: false) => {
    // the "tick()" function should be helpful...
    const _focus = focus ?? get(detail).anyFocus
    if (!get(detail).forceOpen && !hovering() && !_focus) {
      //console.log('open :' + false)
      //onOpen(false)
      open(false)
      return
    }
    //onOpen(null)
  }

  const openTryClose = (hover: b, focus?: false) => {
    ////console.log('openTryClose')
    if (hover) {
      //console.log('open :' + true)
      //onOpen(true)
      open(true)
      return
    }
    tryClose(focus)
  }
  // --------------- Actions -----------------
  const hide = () => {
    //console.log('hide')
    openTryClose(false, false)
  }
  const openClose = (h: b) => {
    //console.log('openClose')
    openTryClose(h, false)
  }
  const toggle = () => {
    open(!get(detail).open)
  }
  const hideIfBlured = () => {
    if (get(detail).open && !hovering() && !get(detail).anyFocus) {
      //console.log('hideIfClickedOutside')
      hide()
    }
  }
  const tryHideIfBlured = (focus: b) => {
    if (!focus && !hovering()) {
      //console.log('tryHideIfBlured')
      hide()
    }
    detail.update(o => ({ ...o, anyFocus: focus }))
  }
  return {
    open,
    hovering,
    tryClose,
    openTryClose,
    toggle,
    // -------
    hide,
    openClose,
    hideIfBlured,
    tryHideIfBlured,
  }
}
