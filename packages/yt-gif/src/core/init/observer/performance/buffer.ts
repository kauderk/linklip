import { isElementVisible } from '$lib/utils'
import { attrInfo } from '../../config/paths'
import { getOption } from '../../../lib/backend-frontend/option'
import { CleanAndBrandNewWrapper } from '../../../lib/utils'
import { SrrGlobal } from '$lib/global/SrrGlobal'
import { initialize_mode } from '$v3/components/drop-down-menu/App/experience/store'

export function FitBuffer(arr: Array<Tobserver | string>, cap: number, creation: string) {
  let atLeastOne = false
  // trying to exploit dynamic types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastOne: any = null
  let stop = arr.length + 0
  let ini = 0 // most defenetly the very first one in the array

  // 1. try to clean wrappers
  while (arr.length > cap) {
    if (stop < 0) throw new Error('index out of bounds')

    lastOne = arr[ini]
    const wrapper = document.querySelector(lastOne) as HTMLElement

    // 2. if wrapper is not on screen, remove it
    if (wrapper) {
      const newCreation = isElementVisible(wrapper) ? attrInfo.creation.forceAwaiting : creation
      CleanAndBrandNewWrapper(wrapper, attrInfo.creation.name, newCreation)
    } else {
      ini++
    }

    // 3. shift last one anyways
    arr.shift()
    atLeastOne = true

    stop--
  }

  arr = [...new Set(arr)] // remove duplicates

  // trying to exploit dynamic types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr = arr.filter((sel: any) => document.querySelector(sel) != null) // remove any that are no longer in the DOM

  return <const>{ shiftedArr: arr, atLeastOne, lastOne }
}
export function FitBuffer_OffScreen(arr: Array<Tobserver | string>, cap: number, creation: string) {
  // 0. work very much in progress....
  const anyLoaded = document.queryAllasArr('.yt-gif-wrapper')

  if (anyLoaded.length < cap) return arr

  // 1. loop through all loaded iframes to see if they are off screen and if so, remove them
  for (const element of anyLoaded) {
    const observer = new window.IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting) return arr

        // 1.1 not in viewport, remove it
        const { shiftedArr } = FitBuffer(arr, cap, creation)
        arr = shiftedArr

        observer.disconnect()
        return (SrrGlobal.YT_GIF_OBSERVERS.masterIframeBuffer = arr) // this can happen in the future...
      },
      { root: null, threshold: 0.1 } // set offset 0.1 means trigger if atleast 10% of element in viewport
    ) // 1.1
    observer.observe(element)
    return arr
  }

  return arr
}
export function toggle_buffers_overflow(bol: boolean) {
  const modes = initialize_mode
  const input_x_buffer = getOption(modes, 'input_x_buffer')

  input_x_buffer.disabled = bol
  if (!bol) input_x_buffer.selected = false

  getOption(modes, 'overflow').selected = bol
  modes.update()
}
