import { createWritable } from '$lib/svelte/local-storage-store'
import { iframeIDprfx } from '$v3/init/config/yt-gif-init'
import type { ComponentProps } from 'svelte'
import type Resize from './Resize.svelte'
import type { size } from './Resize.svelte'
import { getMinSize } from './Resize.svelte'

const playersProps = createWritable({
  thumbnail: true,
  creationCounter: -1,
})
export function getNewPlayerID() {
  playersProps.setPartial(o => ({ creationCounter: o.creationCounter + 1 }))
  return iframeIDprfx + playersProps.get().creationCounter
}

export type Overrides =
  | {
      store?: StoreOverride
      resize?: Omit<ComponentProps<Resize>, 'width' | 'resizing'>
    }
  | undefined
type StoreOverride = { canBeCleanedByBuffer?: b } | undefined
export function createApiStore(o: { playerID: string; override?: StoreOverride }) {
  return {
    canBeCleanedByBuffer: true,
    playerID: o.playerID,
    ...(o.override ?? {}),
  }
}

export const sharedState = {
  size: {
    ytGifs: '175px' as size,
    tutorials: '175px' as size,
    minWidth: getMinSize('175px'),
  },
}
