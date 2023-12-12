// @ts-nocheck
import { signal } from '@preact/signals-core'

// export const map = <Value extends object, StoreExt extends object = {}>(
// 	value?: Value
// ) => {
// 	const _nano = _map(value)
// 	return Object.assign(_nano, {
// 		// avoid strings as keys
// 		mod(newPartial: Partial<Value>) {
// 			Object.entries(newPartial).forEach(([key, value]) => {
// 				// @ts-expect-error
// 				_nano.setKey(key, value)
// 			})
// 		},
// 	})
// }

export function deprecatedSignal<T>(value: T) {
  const _signal = signal(value)
  type K = T //T extends boolean ? boolean : T
  let svelteContract = Object.assign(_signal, {
    // why?
    set(newValue: K) {
      _signal.value = newValue
    },
    update(fn: (oldValue: K) => K) {
      const newValue = fn(_signal.value)
      _signal.value = newValue
    },
  })
  const mod = (newPartial: Partial<K>) => {
    svelteContract.set({ ...svelteContract.read, ...newPartial })
  }
  if (typeof value == 'object') {
    Object.assign(svelteContract, { mod })
  }
  return svelteContract as K extends object
    ? Omit<typeof svelteContract, 'value'> & {
        mod: typeof mod
        get value(): K
      }
    : typeof svelteContract
}
export type deprecatedPreSignal<T> = ReturnType<typeof deprecatedSignal<T>>

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
