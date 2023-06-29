import {
  isRendered,
  closest_container_request,
  closestBlock,
} from '$v3/lib/dom/elements-yt-gif-parent'
import { TimestampsInHierarchy } from '$v3/init/timestamp/hierarchy'
import { ElementsPerBlock } from '$v3/lib/dom/ytgif'
import type { FormmaterHTMLElement } from '$v3/init/observer/timestamp/emulation/types'
import {
  tm_loop_hierarchy,
  tm_loop_options,
  tm_loop_to,
} from '$v3/components/drop-down-menu/App/timestamps/store'

export function ReloadFlow(o: IReload) {
  if (
    o.activeIdx === -1 && // din't find any active
    // and ( only on active or there are no targets)
    (tm_loop_hierarchy.value == 'active' || o.targets.length == 0)
  ) {
    return <const>{ message: 'reload-this' }
  }

  let nextIdx = (o.activeIdx + 1) % o.targets.length
  if (o.includesPlayerOpt) {
    // include player in the loop
    if (o.activeIdx == o.targets.length - 1) {
      // the only scenario where we need to go back to the beginning
      return <const>{ message: 'update-timestamp' }
    } //
    else if (o.activeIdx == -1) {
      // assuming there are targets and the player was reset, go on the next one
      nextIdx = 0
    }
  }

  const nextTarget = o.targets[nextIdx]
  if (isRendered(nextTarget)) {
    return <const>{ message: 'seekTo-strict', target: nextTarget }
  } else {
    return <const>{ message: 'reload-this' }
  }
}

export function QueryTimestampObj(iframe: HTMLIFrameElement, rm_container: Element) {
  const options = tm_loop_options.selectedOptions

  // skip - include_player
  const page = tm_loop_to.value || 'start'
  const sel = `[timestamp-set][timestamp-style="${page}"]`
  const boundedSel = `${sel}:not([out-of-bounds])`
  const tmSel = options.includes('skip') ? boundedSel : sel // Skip if target is missing or if it is out of bounds

  const wrapper = iframe.closest('.yt-gif-wrapper')
  const lastActive = TimestampsInHierarchy(rm_container, wrapper, '[last-active-timestamp]')?.[0]

  const activeSel = ElementsPerBlock(closestBlock(lastActive), tmSel)?.[0] as FormmaterHTMLElement // go one level up and search for an "start" timestamp, bc does it doesn't make sense to loop through "end" boundaries,

  const targets = TimestampsInHierarchy(rm_container, wrapper, tmSel)
  return <const>{
    query: {
      activeIdx: targets.indexOf(activeSel),
      targets,
      includesPlayerOpt: options.includes('include_player'),
    } as IReload,
    wrapper,
  }
}
export async function newFunction(iframe: HTMLIFrameElement) {
  if (!iframe) return <const>{}
  const rm_container = closest_container_request(iframe)
  if (!rm_container) return <const>{}
  return <const>{ rm_container }
}
interface IReload {
  targets: FormmaterHTMLElement[]
  activeIdx: number
  includesPlayerOpt: boolean
}
