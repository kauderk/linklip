import { createSvelteSignal } from '$lib/solid'
import { createSvelteMemo } from '$lib/solid'

export function createToggleStore<T extends o>(target: T, initial?: b) {
  const toggle = createSvelteSignal<boolean>(initial ?? false)
  const listen = createSvelteMemo(() => {
    toggle.signal
    return props()
  })

  function props() {
    const power = toggle.read
    const index = power ? 0 : 1

    type filterStringArray<T> = {
      // @ts-expect-error
      [key in keyof T]: T[key][number]
    }
    return Object.entries(target).reduce((acc, [key, value]) => {
      if (!Array.isArray(value)) {
        return acc
      }
      return {
        ...acc,
        [key]: value[index],
      }
    }, {} as filterStringArray<T>)
  }
  return {
    set: toggle.set.bind(toggle),
    get read() {
      return toggle.read
    },
    derived: listen,
    props,
    tap(value: b | undefined) {
      if (typeof value == 'boolean') {
        toggle.set(value)
      }
      return props()
    },
    toggle() {
      return
    },
  }
}
