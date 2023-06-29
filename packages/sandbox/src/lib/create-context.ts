import { getContext, setContext } from 'svelte'

export function createContext<Key extends string, Fn extends (...args: any) => any>(props: {
  [key in Key]: Fn
}) {
  const [_key, fn] = Object.entries(props)[0]

  // key first letter uppercase
  const key = _key[0].toUpperCase() + _key.slice(1)
  // typescript key first letter uppercase
  type key = Key extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : never

  type get = `get${key}Context`
  type set = `set${key}Context`
  return {
    [`get${key}Context`]: () => getContext(key),
    [`set${key}Context`]() {
      return setContext(key, (fn as Function).apply(this as any, arguments))
    },
  } as {
    [key in get]: () => ReturnType<Fn>
  } & {
    [key in set]: (...args: Parameters<Fn>) => ReturnType<Fn>
  }
}
