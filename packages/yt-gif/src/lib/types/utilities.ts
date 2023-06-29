export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

// https://stackoverflow.com/questions/73626102/make-type-deeply-writable
export type DeepWritable<T> =
  // check for things that are objects but don't need changing
  T extends ((...args: any[]) => any) | Date | RegExp
    ? T
    : T extends ReadonlyMap<infer K, infer V> // maps
    ? Map<DeepWritable<K>, DeepWritable<V>> // make key and values writable
    : T extends ReadonlySet<infer U> // sets
    ? Set<DeepWritable<U>> // make elements writable
    : T extends ReadonlyArray<unknown> // is an array or tuple?
    ? `${bigint}` extends `${keyof T & any}` // is tuple
      ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
      : DeepWritable<T[number]>[] // is regular array
    : T extends object // is regular object
    ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
    : // is primitive or literal value
    //: T extends string
    //? string
    T extends number
    ? number
    : T extends boolean
    ? boolean
    : T

// https://stackoverflow.com/a/56874389/13914180
export type KeysMatching<T extends o, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]
