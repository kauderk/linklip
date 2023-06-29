import { getUniqueSelectorSmart, pathFinder, selfKeyFinder } from '$lib/utils'
import { deleteByValue, deleteProperties } from '$lib/utils/object'
import { PushNew_ShiftAllOlder_IframeBuffer } from '$v3/init/observer/performance'
import type { ICustomPlayerReady } from '$v3/init/observer/timestamp/click/Flow/play/types'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'

export type DeployEventName = 'mouseenter' | 'mousedown' | 'customPlayerReady'
export const defaultDeployTypes = ['mousedown', 'customPlayerReady'] satisfies DeployEventName[]
export type DeployEvent = (MouseEvent | CustomEvent<ICustomPlayerReady>) & {
  type: DeployEventName
}
export function deployListeners(target: HTMLElement, [callback]: [(event: DeployEvent) => void]) {
  const eventNames = [...defaultDeployTypes, 'mouseenter']
  eventNames.forEach(name => {
    target.removeEventListener(name, callback as EventListener, false)
    target.addEventListener(name, callback as EventListener, { once: true })
  })
  return {
    destroy() {
      eventNames.forEach(name => {
        target.removeEventListener(name, callback as EventListener, false)
      })
      target.remove()
    },
  }
}
export function expression(target: HTMLElement, expression: Function | void) {
  if (target.tagName !== 'JS') {
    throw new Error('Invalid expression')
  }
  target.hidden = true
  expression?.()
  return returnAction(target)
}
function returnAction(target: HTMLElement, assign?: { destroy?: Function }) {
  return {
    destroy() {
      assign?.destroy?.()
      target.remove()
    },
  }
}

export function deleteApiCallbacks(api: YT_TargetWrapper | undefined) {
  if (!api) return

  try {
    // @ts-ignore
    const iframe = api.t?.getIframe()
    if (iframe) {
      // @ts-ignore
      deleteByValue(api.t, iframe)
    }
  } catch (error) {
    console.error(error)
  }

  let attempts = ['m.h', 'm.i', 'i.h', 'X']
  while (attempts.length) {
    try {
      if (attempts[attempts.length - 1]) {
        // you might know where it is
        deleteProperties(
          // @ts-ignore
          pathFinder(api.t, attempts[attempts.length - 1])
        )
      } else {
        // bad luck search the whole tree
        // @ts-ignore
        deleteProperties(selfKeyFinder(api.t, 'onReady'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      attempts.pop()
    }
  }
}

/**
 * Performance Mode - Iframe Buffer & Initialize on interaction - synergy
 */
export function buffer(target: HTMLElement, canBeCleanedByBuffer: b) {
  if (canBeCleanedByBuffer) {
    // sometimes the parent is already gone - while loading iframe
    const cssPath = getUniqueSelectorSmart(target)
    PushNew_ShiftAllOlder_IframeBuffer(cssPath)
  }
  return returnAction(target)
}
