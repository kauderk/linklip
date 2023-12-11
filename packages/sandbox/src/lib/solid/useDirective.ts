import { type SvelteSignal, effect } from '$lib/solid'
import { cleanAction } from '$lib/stores'

export function useClass(element: HTMLElement, signalList: Record<string, SvelteSignal<boolean>>) {
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
