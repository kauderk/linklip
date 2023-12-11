import { createEffect, createSignal, type Accessor, createMemo, untrack } from 'solid-js'
// import type { Readable, Writable } from 'svelte/store'

export interface $Writable<T> {
  set: (newValue: T | ((prev: T) => T)) => void
  subscribe: (fn: (value: T) => void) => () => void
  update: (fn: T | ((prev: T) => T)) => void
  mod: (newPartial: Partial<T>) => void
  get value(): T
  set value(newValue: T)
  toSignal: <T>() => ReturnType<typeof createSignal<T>>
  peek: () => T
}
export const createSvelteSignal = <T>(value: T) => {
  const [signal, setSignal] = createSignal<T>(value)

  return <$Writable<T>>{
    // @ts-expect-error
    set: newValue => setSignal(typeof newValue == 'function' ? newValue(signal()) : newValue),
    subscribe(fn) {
      createEffect(() => fn(signal()))
      return () => {}
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
    peek: () => untrack(signal),
    get value() {
      return signal()
    },
    set value(newValue) {
      // @ts-expect-error
      setSignal(newValue)
    },
    toSignal: () => [signal, setSignal],
  }
}

export type SvelteSignal<T> = ReturnType<typeof createSvelteSignal<T>>

export type $Readable<T> = {
  subscribe: (fn: (value: T) => () => void) => void
}
export const createSvelteMemo = <T>(fn: () => T) => {
  const signal = createMemo(fn)
  Object.assign(signal, <$Readable<T>>{
    subscribe: fn => {
      createEffect(() => fn(signal()))
      return () => {}
    },
  })
  return signal as Accessor<T> & $Readable<T>
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
