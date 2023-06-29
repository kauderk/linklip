import type { PreSignal } from '$lib/pre-signal'
import { cleanAction } from '$lib/stores'
import { effect } from '@preact/signals-core'

export function useClass(element: HTMLElement, signalList: Record<string, PreSignal<boolean>>) {
  const list: typeof signalList =
    // @ts-expect-error
    typeof signalList == 'function' ? signalList() : signalList

  return cleanAction(
    ...Object.entries(list).map(([className, signal]) =>
      effect(() => {
        element.classList.toggle(className, signal.value)
      })
    )
  )
}
