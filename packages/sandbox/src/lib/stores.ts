import type { PreSignal } from '$lib/pre-signal'
// https://svelte.dev/repl/90847a5d2bac438184ce5548137853c2?version=3.50.0

export function debounceWritable<T>(store: PreSignal<T>, delay = 400) {
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

export function diffStore<T>(store: PreSignal<T>) {
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
  }
}
