import { ObjectEntries } from '$lib/utils'

export function destroyEvents<K extends keyof GlobalEventHandlersEventMap>(
  target: HTMLElement,
  eventObject: {
    [key in K]: (event: GlobalEventHandlersEventMap[K]) => void
  }
) {
  for (const [event, listener] of ObjectEntries(eventObject)) {
    target.addEventListener(event, listener)
  }
  return {
    destroy() {
      for (const [event, listener] of ObjectEntries(eventObject)) {
        target.removeEventListener(event, listener)
      }
      return target.remove()
    },
  }
}
