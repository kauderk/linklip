import type { FormatterObjectAsKey } from '$v3/init/observer/timestamp/emulation/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TMap<V> = Map<any, V>
export function Value_AtIndexInMap<M, n extends number, K extends isKey>(
  map: TMap<M>,
  valueAtIndex: n,
  property: K
): K extends 'is alias' | 'is component' ? string : FormatterObjectAsKey {
  const key = FilterMapByIsKey(map, property)?.[valueAtIndex]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return map?.get(key!) as any // it's ok to return undefined
}
export function ObjKey_AtIndexInMap<M>(map: TMap<M>, valueAtIndex: number, property: isKey) {
  return FilterMapByIsKey(map, property)?.[valueAtIndex]
}
function FilterMapByIsKey<V>(map: Map<FormatterObjectAsKey, V>, property: isKey) {
  if (!map || map?.size == 0) return null
  return [...map.keys()].filter(o => o['isKey'].includes(property))
}
