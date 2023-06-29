import { ObjectKeys } from '$lib/utils'

import * as Timestamps from '../App/timestamps/props'
import * as Observer from '../App/deployment/props'
import * as Experience from '../App/experience/props'
import * as PlayerSettings from '../App/player-settings/props'
import * as Miscellaneous from '../App/miscellaneous/props'
import * as Updates from '../App/settings/label/info/props'
import * as Info from '../App/settings/label/updates/props'
import * as Settings from '../App/settings/props'

const props = {
  [Timestamps.menu.name]: Timestamps,
  [Observer.menu.name]: Observer,
  [Experience.menu.name]: Experience,
  [PlayerSettings.menu.name]: PlayerSettings,
  [Miscellaneous.menu.name]: Miscellaneous,
  [Updates.menu.name]: Updates,
  [Info.menu.name]: Info,
  [Settings.menu.name]: Settings,
}
let lastKey = ObjectKeys(props)[0]
const instance = (obj: any) => {
  const index = Object.values(props).indexOf(obj)
  return index ? (lastKey = ObjectKeys(props)[index]) : ''
}
export const stack: { root: keyof typeof props; value: s; property: s }[] = []
function iterate(obj: { [key: PropertyKey]: object }) {
  for (var property in obj) {
    if (obj.hasOwnProperty?.(property) || instance(obj)) {
      if (typeof obj[property] == 'object') {
        // @ts-expect-error
        iterate(obj[property])
      } else {
        if (
          obj[property] &&
          (property == 'name' || (property?.length > 2 && property == 'data-tooltip'))
        ) {
          stack.push({
            property,
            root: lastKey,
            // @ts-expect-error
            value: obj[property],
          })
        }
      }
    }
  }
}

iterate(props)
