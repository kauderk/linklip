export function noInvalidate<T>(value: T) {
  const mod = (newPartial: Partial<T>) => {
    // @ts-expect-error
    Object.assign(value, newPartial)
  }

  return {
    _set(t: T) {
      value = t
    },
    get read() {
      return value
    },
    mod: mod as T extends object ? typeof mod : never,
  }
}

export const ignoreCssRules = { ['ignoreCssRules']: '' }

export const tsAny = (e: any) => e as any
