import { deepMerge } from '$lib/utils/object'
import type { URLButtonType } from '$v3/init/formatter/button/creation'
import type { TryToUpdateBlock_fmt } from '$v3/init/formatter/Flow'

export type TDropDown = {
  drop: {
    type: URLButtonType
    on: s
  }
  sub: {
    [key: s]: {
      tooltip: s
      on: s
      type: s
    }
  }
}
type response = Awaited<ReturnType<typeof TryToUpdateBlock_fmt>>
export type action = { action: () => Promise<response> }
export type TDropDownActions = {
  drop: {
    type: URLButtonType
    on: s
  }
  sub: {
    [key: s]: {
      tooltip: s
      on: s
      type: s
    } & action
  }
}

export type CreateDropDownActions<T = unknown> = (data: T) => TDropDownActions

/**
 * `Object.assign(copy, { sub })` returns the perfect type
 * yet it overrides the `copy` object
 * @returns the same object but with formatter actions
 */
export const createAssignActions = <T extends TDropDown>(
  copy: T,
  sub: { [key in keyof T['sub']]: action }
) => {
  return deepMerge(copy, { sub }) as T & { sub: typeof sub }
}
