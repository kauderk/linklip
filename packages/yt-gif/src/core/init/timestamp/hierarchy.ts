import { closest_container_request } from '../../lib/dom/elements-yt-gif-parent'
import type { FormmaterHTMLElement } from '../observer/timestamp/emulation/types'

export function TimestampsInHierarchy<T extends FormmaterHTMLElement>(
  rm_container: Element,
  targetWrapper: QrySearch,
  allSelector: string
) {
  const badSets = rm_container
    .queryAllasArr('.yt-gif-wrapper')
    .filter(w => w != targetWrapper)
    .map(w => closest_container_request(w)?.queryAllasArr(allSelector))
    .flat(Infinity)

  const actives = Array.from(rm_container.querySelectorAll(allSelector)).filter(
    tm => !badSets.includes(tm)
  )

  return actives as T[]
}
