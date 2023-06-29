export type IChange<V> = {
  value: V
  invalidate?: boolean
}
type PrivateKeys = 'change' | 'subscribe'

type ExcludeKeys<T extends object, ToExlude> = {
  [K in keyof T]: K extends ToExlude ? never : any
}
export type ExcludeRecord<K extends s> = Partial<Record<K, never>>
export type ExcludeStoreKeys<T> = T & ExcludeRecord<PrivateKeys>
