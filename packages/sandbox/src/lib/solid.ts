import {
  createComputed,
  createSignal,
  type Accessor,
  createMemo,
  untrack,
  from,
  observable,
  createRoot,
  onMount as _onMount,
  onCleanup,
} from 'solid-js'
// https://github.com/solidjs/solid/discussions/397#discussioncomment-595304
// https://codesandbox.io/s/derivation-j0nzm?file=/index.js
export { createComputed, onCleanup, createRoot } from 'solid-js'
// import type { Readable, Writable } from 'svelte/store'

export interface $Writable<T> {
  set: (newValue: T | ((prev: T) => T)) => void
  subscribe: (fn: (value: T) => void) => () => void
  /**
   * React to its own changes and ignore/untrack changes from other signals
   */
  compute: (fn: (value: T) => void) => void
  update: (fn: T | ((prev: T) => T)) => void
  mod: (newPartial: Partial<T>) => void
  get value(): null
  get signal(): T
  set write(newValue: T)
  // toSignal: <T>() => ReturnType<typeof createSignal<T>>
  get read(): T
}
export const createSvelteSignal = <T>(value: T) => {
  const [signal, setSignal] = createSignal<T>(value)
  const obs = observable(signal)

  return <$Writable<T>>{
    // @ts-expect-error
    set: newValue => setSignal(typeof newValue == 'function' ? newValue(signal()) : newValue),
    subscribe(fn) {
      return subscription<T>(signal, fn)
    },
    compute(fn) {
      const v = signal()
      createComputed(() => untrack(() => fn(v)))
    },
    update(incoming) {
      // @ts-expect-error
      const newValue = typeof incoming == 'function' ? incoming(signal()) : incoming
      setSignal(newValue)
    },
    mod(newPartial) {
      if (typeof value == 'object') {
        setSignal(old => ({ ...old, ...newPartial }))
      } else {
        setSignal(newPartial as any)
      }
    },
    get signal() {
      return signal()
    },
    get read() {
      return untrack(signal)
    },
    // @ts-expect-error
    set write(newValue) {
      // @ts-ignore
      setSignal(newValue)
    },
  }
}

export type SvelteSignal<T> = ReturnType<typeof createSvelteSignal<T>>

export interface $Readable<T> {
  subscribe: (fn: (value: T) => void) => () => void
  get read(): T
}
export const createSvelteMemo = <T>(fn: () => T) => {
  const signal = createMemo(fn)
  return <$Readable<T>>{
    subscribe(fn) {
      return subscription<T>(signal, fn)
    },
    get value() {
      return signal()
    },
    get read() {
      return untrack(signal)
    },
  }
}

/**
 * Svelte needs this to run as soon as it is created
 */
function subscription<T>(signal: Accessor<T>, fn: (value: T) => void) {
  return effect(() => {
    const v = signal()
    untrack(() => fn(v))
  })
}

/**
 * @returns unsubscribe function
 */
export function effect<T>(fn: () => void) {
  return createRoot(disposer => {
    createComputed(fn)
    return disposer
  })
}

export function onMount(fn: () => any | (() => () => void)) {
  _onMount(() => {
    const res = fn()
    if (typeof res == 'function') {
      onCleanup(res)
    }
  })
}

/**
 * Less Call Stack
 */
export function createObservable<T>(initialValue: T = {} as T) {
  let _value: T = initialValue
  let _subscribers: ((payload: T) => void)[] = []

  return {
    get value(): T {
      return _value
    },
    set value(payload: T) {
      this.set(payload)
    },
    set(payload: T) {
      if (_value === payload) return

      _value = payload
      this.notify()
    },
    notify() {
      _subscribers.forEach(observer => {
        observer(_value)
      })
    },
    subscribe(cb: (payload: T) => void) {
      _subscribers.push(cb)
      cb(_value)
      return () => {
        // unsubscribe
        _subscribers = _subscribers.filter(o => o !== cb)
      }
    },
    /**
     * Subscribe without calling the callback immediately
     */
    $ubscribe(cb: (payload: T) => void) {
      _subscribers.push(cb)
      return () => {
        // unsubscribe
        _subscribers = _subscribers.filter(o => o !== cb)
      }
    },
  }
}
export type Observable<T> = ReturnType<typeof createObservable<T>>
