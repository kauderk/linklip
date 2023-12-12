import { debounceWritable, diffStore } from '$lib/stores'
import { createSvelteMemo } from '$lib/solid'
import type { Progress } from '../scrubber'
import { createRelativeRatio, createTiles, deriveRatio, type _boundary_ } from './compute'

export function createDiffBoundary() {
  const progress = createRelativeRatio()
  const preview = createRelativeRatio()

  const results = createSvelteMemo(() => ({
    progress: progress.signal,
    preview: preview.signal,
  }))

  return {
    tryInvalidate(args: { boundary: typeof _boundary_; progress: Progress }) {
      Object.entries({ progress, preview }).forEach(([key, store]) => {
        const previous = store.read
        const { boundary, progress } = args

        const next = deriveRatio(previous, {
          boundary,
          // @ts-expect-error
          globalRatio: progress[key],
        })

        // DO NOT INVALIDATE the store if the values didn't change
        if (JSON.stringify(next) !== JSON.stringify(previous)) {
          // console.log('set', key)
          store.write = next
        } else {
          // // console.log('extra rerender')
        }
      })
    },
    batch: results,
    progress,
    preview,
  }
}
export function createDiffRatio() {
  return debounceWritable(diffStore(createTiles()))
}
