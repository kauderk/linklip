import { tm_workflow_grab } from '$v3/components/drop-down-menu/App/timestamps/store'
import type { FormmaterHTMLElement } from '$v3/init/observer/timestamp/emulation/types'
import { stopEvents } from '../../../../lib/helpers'
import { floatParam } from '../../../../lib/utils'
import { fmtTimestamp } from '../../../timestamp/utils'

export function StopPropagations(
  urlBtn: (page: Tpage) => FormmaterHTMLElement,
  targetNode: El,
  innerWrapperSel = '.yt-gif-url-btns'
) {
  const innerWrapper = targetNode.querySelector(innerWrapperSel) as FormmaterHTMLElement
  if (innerWrapper) {
    innerWrapper.onmousedown = stopEvents
  }

  btnNames.map(s => urlBtn(s)).forEach(btn => (btn.onmousedown = stopEvents))
}
export const btnNames: Array<Tpage> = ['yt-gif', 'format', 'url', 'start', 'end', 'start|end']
function getFmtPage(p: s, url: s) {
  return fmtTimestamp(tm_workflow_grab.value)(floatParam(p, url) || '0')
} // javascript is crazy!

export function startTm(url: s) {
  return getFmtPage('t|start', url)
}
export function endTm(url: s) {
  return getFmtPage('end', url)
}
