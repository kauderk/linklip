// https://stackoverflow.com/a/57486510
//TODO
type Broaden<T> = T extends s ? s : T extends n ? n : never
export function objectMap<
  Obj extends Record<s, any>,
  T = Obj extends Record<s, infer Type> ? Broaden<Type> : never
>(
  obj: Obj,
  valSelector: (val: T, obj: Obj) => T,
  keySelector?: (key: string, obj: Obj) => string,
  ctx?: Obj
) {
  const ret = {} as Record<keyof Obj, T>

  for (const key of Object.keys(obj)) {
    const retKey = keySelector ? keySelector.call(ctx || null, key, obj) : key
    const retVal = valSelector.call(ctx || null, obj[key], obj)
    // @ts-expect-error
    ret[retKey] = retVal
  }
  return ret
}
export const mapRange = (value: number, a: number, b: number, c: number, d: number) => {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a)
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c)
}

//#region transform step data
export function flipStep(step: startEnd | b): startEnd {
  return step == true || step == 'end' ? 'start' : 'end'
}
export function Backwards(step: s) {
  return step == 'start'
}
export function Direction(direction: b) {
  return direction ? -1 : 1
}
//#endregion
