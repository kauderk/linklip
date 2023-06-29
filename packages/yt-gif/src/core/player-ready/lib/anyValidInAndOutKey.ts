import { InAndOutKeys } from '$v3/components/drop-down-menu/App/stores/default'
import { playIs } from './IFR'

//#region hover/interactions utils

export function anyValidInAndOutKey(e: MouseEvent) {
  if (e.buttons == 4) {
    return true
  }

  return (
    InAndOutKeys.split(',')
      .map(s => s.trim())
      .filter(s => !!s)
      // @ts-ignore
      .some(k => e[k])
  )
}
export function AnyPlayOnHover() {
  return playIs('soft') || playIs('strict')
}
