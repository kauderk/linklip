import type { SelectOptionsProxy, CustomSelectOptionsProxy } from '$v3/init/config/UIStore/types'

type Proxy = CustomSelectOptionsProxy | SelectOptionsProxy

/* ********************* */
export function isSelected<P extends Proxy, K extends keyof P['options']>(
  select: P,
  ...checkValues: K[]
) {
  return select.selectedOptions.find(selected =>
    // @ts-expect-error
    checkValues.includes(selected)
  ) as K | undefined
}
export function getOption<P extends Proxy>(select: P, value: P['value']) {
  const option = Object.keys(select.options).find(option => option == value)
  if (!option) {
    throw new Error(`SelectProxy'Option is undefined, ${value}`)
  }
  return select.options[option] as Required<typeof select.options[typeof option]>
}
type Required<T> = {
  [P in keyof T]-?: T[P]
}

export function getSelectOption(select: HTMLSelectElement, value?: string) {
  value ??= select.value
  return Array.from(select.options).find(o => o.value == value) as HTMLOptionElement
}
