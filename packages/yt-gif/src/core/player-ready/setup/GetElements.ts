import { cssData } from '$v3/init/config/paths'
import { closestYTGIFparentID, getWrapperUrlSuffix } from '$v3/lib/dom/elements-yt-gif-parent'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import type { HTMLResetButton } from '../listener/control/reset-btn/types'
import type { IFR } from '../types'

function GetElementsObj(key: string, t: YT_TargetWrapper) {
  const iframe = (document.getElementById(key) as IFR) || t.getIframe()
  const wrapper = getParent(iframe)! as HTMLElement
  const timeDisplay = wrapper.querySelector('div.' + cssData.yt_gif_timestamp) as HTMLElement
  const timeDisplayStart = timeDisplay.querySelector('.yt-gif-timestamp-start')!
  const timeDisplayEnd = timeDisplay.querySelector('.yt-gif-timestamp-end')!
  const resetBtn = wrapper.querySelector('[data-yt-gif-url-btn="reset"]') as HTMLResetButton
  const withEventListeners = [wrapper, wrapper.parentNode as El, timeDisplay, iframe] // ready to be cleaned

  return <const>{
    mapID: getBlockID(iframe),
    iframe: iframe,
    wrapper: wrapper,
    timeDisplay,
    resetBtn,
    withEventListeners,
    timeDisplayStart,
    timeDisplayEnd,
  }
}
export type TQueryElements = ReturnType<typeof GetElementsObj>
export function getBlockID(iframe: IFR) {
  return closestYTGIFparentID(iframe) + getWrapperUrlSuffix(getParent(iframe)!)
}

export function getParent(i: Element) {
  return i.closest('.' + cssData.yt_gif_wrapper) || i.parentElement
}
