import { isNotZoomPath, isRendered, isElementVisible } from '$lib/utils'
import type { CreateParams } from './types'

export function createElementIntersectionCycle(
  target: CreateParams['target'],
  callback: () => Promise<any>
) {
  if (isElementVisible(target)) {
    callback()
    return
  }
  const yobs = new IntersectionObserver(
    async entries => {
      if (!entries[0]) yobs.disconnect()

      for (const entry of entries)
        if (entry.isIntersecting) {
          await callback()
          yobs.disconnect()
          break
        }
    },
    {
      threshold: [0],
    }
  )

  yobs.observe(target)

  return yobs
}

export function validTemplates(el: HTMLElement): el is HTMLElement {
  //AvoidAllZoomChildren
  const trace = !isRendered(el) || !el.closest('.rm-block-main') || !isNotZoomPath(el) || el.hidden
  return !trace
}
export function processUnknownTargets(targets: HTMLElement[]) {
  return targets.map(target => ({
    target: target as HTMLElement,
    payload: <unknown>{},
  }))
}
