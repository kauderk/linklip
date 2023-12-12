import type { SvelteSignal } from '$lib/solid'
import type { ActionReturn } from '$lib/event-life-cycle'
// https://svelte.dev/repl/90847a5d2bac438184ce5548137853c2?version=3.50.0

export function debounceWritable<T>(store: SvelteSignal<T>, delay = 400) {
  let timer: NodeJS.Timeout
  const prevSubscribe = store.subscribe

  store.subscribe = ((fn: (value: T) => void) => {
    fn(store.read)

    const unsubscribe = prevSubscribe.bind(store)(value => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn(value)
      }, delay)
    })

    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }).bind(store)
  return store
}

// TODO: use solid-js (prev: T, next: T) => boolean API
export function diffStore<T>(store: SvelteSignal<T>) {
  Object.assign(store, {
    set write(next: T) {
      const previous = store.read

      // DO NOT INVALIDATE the store if the values didn't change
      if (JSON.stringify(next) !== JSON.stringify(previous)) {
        store.set(next)
      } else {
        // console.log('extra rerender')
      }
    },
  })
  return store
}

export function cleanSubscribers(...unsubscribers: (() => void)[]) {
  return () =>
    unsubscribers.forEach(fn => {
      if (typeof fn !== 'function') debugger
      fn()
    })
}
export function cleanAction(...unsubscribers: (() => void)[]) {
  return {
    destroy: cleanSubscribers(...unsubscribers),
  } satisfies ActionReturn
}
