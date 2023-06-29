import { derived, get, writable } from 'svelte/store'
import type { KeysMatching } from '$lib/types/utilities'

export function createToggleStore<T extends o>(target: T, initial?: b) {
  const toggle = writable(initial ?? false)
  const listen = derived(toggle, _ => props())

  function props() {
    const power = get(toggle)
    const index = power ? 0 : 1

    type filterStringArray<T extends o> = {
      [key in KeysMatching<T, s[]>]: s
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
    ...toggle,
    derived: listen,
    subscribe: toggle.subscribe,
    props,
  }
}
