import type { SvelteSignal } from '$lib/solid'

// input of createSerializableStore
type Shape<O> = O extends { value: infer V }
  ? O extends { decorator: (value: any) => infer W }
    ? {
        value: ((override?: Unwrap<V>) => Unwrap<V>) | Unwrap<V>
        // if you could infer the actual typeWrapper instead of the parameter...
        // for example Signal instead of number
        // in Signal<number>
        decorator: (value: Unwrap<V>) => GenericUnwrap<W, Unwrap<V>>
        // TODO: should be optional if the decorator has the peek method
        serialize?(decorator: GenericUnwrap<W, Unwrap<V>>): Unwrap<V>
      }
    : {
        value: ((override?: Unwrap<V>) => Unwrap<V>) | Unwrap<V>
        serialize: (value: Unwrap<V>) => Unwrap<V>
      }
  : O

// output of createSerializableStore
type FlatDecorators<T> = {
  [key in keyof T]: Unwrap<T[key]> extends { value: infer V }
    ? Unwrap<T[key]> extends { decorator: (value: any) => infer W }
      ? // oh my god
        GenericUnwrap<W, Unwrap<V>> & { serialize(): Unwrap<V> }
      : V & { serialize(): Unwrap<V> }
    : Unwrap<T[key]>
}

/**
 * ```
    const _Config = {
     width: 350, // it can take primitive values
     resizing: { // or decorators
        value: false,
        decorator: signal, // right now it's hard coded to fallback to signals
     },
				aspectRatio: {
        value: [16, 9] as [number, number], // the shape should infer all the types
        decorator: aspectRatioFrom, // but it should be able to accept any decorator
        serialize: (decorator) => decorator.tuple,
     },
     resizeMode: {
        value: 'inlineBlock',
        decorator: signal, // in fact it would be nice if the types understood some signals are redundant
     },
		 // these first level functions will be executed after the pure values
     rect() {
				 // can accept functions to derive values
        return ()=> ({
          value: { x, y, width, height },
          decorator: signal,
        })
      }
    }
 * ```
 * @param _Config The schema with the raw values and their possible decorators
 * @returns The store with the decorators applied and their serialized methods
 */
export function createSerializableStore<T extends { [key in keyof T]: Shape<T[key]> }>(_Config: T) {
  // capture the type ;v
  return (_overrides?: Prettify<Partial<FlatValues<T>>>) => {
    let result = {} as any

    for (const key of Object.keys(_Config) as Array<keyof typeof _Config>) {
      const schema = _Config[key]

      if (typeof schema == 'function') {
        continue
      }

      resolveKey(schema, key, _overrides?.[key])
    }
    // now deal with the derived functions
    for (const key of Object.keys(_Config) as Array<keyof typeof _Config>) {
      const schema = _Config[key]
      if (typeof schema == 'function') {
        const newType = schema.bind(result)(result)

        resolveKey(newType, key, _overrides?.[key])
      }
    }

    function resolveKey(schema: any, key: any, override: any) {
      if (typeof schema != 'object') {
        // primitive value
        result[key] = override ?? schema
        return
      }

      const merged =
        typeof schema.value == 'function' ? schema.value(override) : override ?? schema.value
      const serialize = schema.serialize

      if ('decorator' in schema) {
        const newType = schema.decorator(merged)

        if ('serialize' in schema) {
          newType.serialize = () => serialize(newType)
        } else if ('peek' in newType) {
          newType.serialize = () => newType.peek()
        }

        result[key] = newType
      } else if ('serialize' in schema) {
        const newType = merged

        newType.serialize = () => serialize(newType)

        result[key] = newType
      } else {
        // but it could be a plain object
        result[key] = merged
      }
    }

    result.serialize = () => Serialize<FlatDecorators<T>>(result)
    return result as any as FlatDecorators<T> & { serialize(): FlatValues<T> }
  }
}

// FIXME: make it generic, for real
type GenericUnwrap<T, V> = T extends SvelteSignal<any> ? SvelteSignal<V> : T
type Unwrap<F> = F extends (...args: any) => infer V ? V : F

export type FlatValues<T> = {
  [key in keyof T]: Unwrap<T[key]> extends { value: infer V } ? Unwrap<V> : Unwrap<T[key]>
}
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

// @ts-expect-error
const Serialize = function <T>(self: ReturnType<typeof createSerializableStore<T>>) {
  return Object.entries(self).reduce((acc: any, [key, value]: any) => {
    if (typeof value != 'object') {
      acc[key] = value
    } else if ('serialize' in value) {
      acc[key] = value.serialize()
    } else {
      acc[key] = value
    }
    return acc
  }, {} as FlatValues<T>)
}
