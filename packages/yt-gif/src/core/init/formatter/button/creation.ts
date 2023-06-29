import type { FormmaterHTMLElement } from '$v3/init/observer/timestamp/emulation/types'

/* ***************** */

export function GetConfirmBtns(btnNames: s[], urlBtn: Function) {
  // TODO : how do you know which ppts are being used before hand?
  return () =>
    btnNames
      .map(s => urlBtn(s))
      .forEach(btn => {
        const p: HTMLElement = btn?.closest('.btn-row') || btn?.closest('.yt-gif-url-btn-wrapper')
        if (p && !btn.onclick) p.style.display = 'none'
      })
}
export function GetUrlBtn<type>(el: El, sel: s) {
  return (page: type) =>
    el.querySelector(`${sel} [data-yt-gif-url-btn="${page}"]`) as FormmaterHTMLElement
}
