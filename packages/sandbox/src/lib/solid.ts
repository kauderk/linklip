import { createEffect, createSignal, type Accessor, createMemo } from 'solid-js'
// import type { Readable, Writable } from 'svelte/store'

export interface $Writable<T> {
  set: (newValue: Exclude<T, Function> | ((prev: T) => T)) => void
  subscribe: (fn: (value: T) => void) => () => void
  update: (fn: Exclude<T, Function> | ((prev: T) => T)) => void
  mod: (newPartial: Partial<Exclude<T, Function>>) => void
  get value(): T
  set value(newValue: T)
  toSignal: <T>() => ReturnType<typeof createSignal<T>>
  peek: () => T
}
export const createSvelteSignal = <T>(value: T) => {
  const [signal, setSignal] = createSignal<T>(value)

  return <$Writable<T>>{
    set: newValue => setSignal(newValue),
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
    peek: () => signal(),
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

// export const [count, setCount] = createSvelteSignal(0)
// export const double = createSvelteMemo(() => count() * 2)
