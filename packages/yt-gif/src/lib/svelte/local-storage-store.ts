import { get, writable as svelteWritable } from 'svelte/store'
import { recursiveAssign } from '../utils/object'

export function createWritable<T>(startValue: T) {
  const store = svelteWritable(startValue)

  const read = () => get(store)
  const write = (newValue: T) => store.set(newValue)

  return {
    ...store,
    /**
     * Convenient way to get the store's getter and setter
     * @returns [read, write]
     */
    effect: (): [typeof read, typeof write] => [read, write],
    reset: () => write(startValue),
    setPartial<O extends T & object>(partial: Partial<O> | ((current: T) => Partial<O>)) {
      const current = read()
      partial = typeof partial == 'function' ? partial(current) : partial
      // @ts-expect-error
      const newValue = recursiveAssign<O>(current, partial)
      // @ts-expect-error
      store.set(newValue)
    },
    setFrom(previousHandler: (value: T) => T) {
      write(previousHandler(read()))
    },
    get: read,
  }
}
