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

export function preSignal<T>(value: T) {
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
    svelteContract.set({ ...svelteContract.peek(), ...newPartial })
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
export type PreSignal<T> = ReturnType<typeof preSignal<T>>
