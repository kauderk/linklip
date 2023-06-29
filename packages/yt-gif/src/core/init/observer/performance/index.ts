import { pushSame } from '$lib/utils'
import { attrInfo } from '../../config/paths'
import {
  isInputSelected,
  isIntersection_selectedValid,
} from '../../../lib/dom/select/isInputSelected'
import { FitBuffer_OffScreen, FitBuffer, toggle_buffers_overflow } from './buffer'
import { SrrGlobal } from '$lib/global/SrrGlobal'
import { iframe_buffer_slider } from '$v3/components/drop-down-menu/App/experience/store'

export function PushNew_ShiftAllOlder_IframeBuffer(parentCssPath: string) {
  if (parentCssPath)
    SrrGlobal.YT_GIF_OBSERVERS.masterIframeBuffer = pushSame(
      SrrGlobal.YT_GIF_OBSERVERS.masterIframeBuffer,
      parentCssPath
    )

  ifBuffer_ShiftOldest() // modifies and returns masterIframeBuffer
}
export function ifBuffer_ShiftOldest() {
  if (isInputSelected())
    // everything else are buffer variations
    return null

  // work in progress | by shifting/removing the first entry, you clean the most irrelevant YT GIF, and give space to new ones (to load, thus autoplay on mouseenter) when intersecting the website
  let arr = SrrGlobal.YT_GIF_OBSERVERS.masterIframeBuffer
  const cap = Number(iframe_buffer_slider.value)
  const { displaced, buffer } = attrInfo.creation

  if (isIntersection_selectedValid()) {
    // 2.
    arr = FitBuffer_OffScreen(arr, cap, displaced)
  } else {
    // 2. while...
    const { shiftedArr, atLeastOne: shifted } = FitBuffer(arr, cap, buffer)
    arr = shiftedArr
    // 2.1 mix and match
    if (shifted || cap <= arr.length) {
      // there is space
      toggle_buffers_overflow(true)
    } else if (!shifted && cap > arr.length) {
      // overflow
      toggle_buffers_overflow(false)
    }
  }

  // 3. pass by value
  return (SrrGlobal.YT_GIF_OBSERVERS.masterIframeBuffer = arr)
}
