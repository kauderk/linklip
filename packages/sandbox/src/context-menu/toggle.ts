import { preSignal } from '$lib/pre-signal'
import { computed } from '@preact/signals-core'

export function createToggleStore<T extends o>(target: T, initial?: b) {
  const toggle = preSignal<boolean>(initial ?? false)
  const listen = computed(() => {
    toggle.value
    return props()
  })

  function props() {
    const power = toggle.peek()
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
    peek: toggle.peek.bind(toggle),
    derived: listen,
    subscribe: toggle.subscribe.bind(toggle),
    props,
    tap(value: b | undefined) {
      if (typeof value == 'boolean') {
        //@ts-expect-error FIXME: type error
        toggle.set(value)
      }
      return props()
    },
    toggle() {
      return
    },
  }
}
