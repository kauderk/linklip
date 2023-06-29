import { createSelectStore } from './factory/select'
import type { Lookup } from './types'

type attrs = 'multiple' | 'custom'
function Attributes(attributes: attrs[] = []) {
  return {
    attributes,
    hasAttribute(s: attrs) {
      attributes.includes(s)
    },
  }
}
export function createCustomSelectStore<L extends Lookup>(lookup: L, attributes: attrs[]) {
  const store = createSelectStore(lookup)
  const newStore = Object.assign(store, Attributes(attributes))
  const fail = () => ({
    customSelect: (bol: boolean) => {},
    ...Attributes(attributes),
  })
  Object.values(newStore.options).forEach(option => Object.assign(option, fail()))
  return newStore
}
