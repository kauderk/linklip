import type { SvelteSignal } from '$lib/solid'
import type { ActionReturn } from '$lib/event-life-cycle'
// https://svelte.dev/repl/90847a5d2bac438184ce5548137853c2?version=3.50.0

export function debounceWritable<T>(store: SvelteSignal<T>, delay = 400) {
  let timer: number
  const prevSubscribe = store.subscribe

  store.subscribe = ((fn: (value: T) => void) => {
    fn(store.peek())

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
  const prevSet = store.set
  store.set = ((next: T) => {
    const previous = store.peek()

    // DO NOT INVALIDATE the store if the values didn't change
    if (JSON.stringify(next) !== JSON.stringify(previous)) {
      prevSet.bind(store)(next)
    } else {
      // console.log('extra rerender')
    }
  }).bind(store)
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
