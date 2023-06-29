import { debounceWritable, diffStore } from '$lib/stores'
import { computed } from '@preact/signals-core'
import type { Progress } from '../scrubber'
import { createRelativeRatio, createTiles, deriveRatio, type _boundary_ } from './compute'

export function createDiffBoundary() {
  const progress = createRelativeRatio()
  const preview = createRelativeRatio()

  const results = computed(() => ({
    progress: progress.value,
    preview: preview.value,
  }))

  return {
    tryInvalidate(args: { boundary: typeof _boundary_; progress: Progress }) {
      Object.entries({ progress, preview }).forEach(([key, store]) => {
        const previous = store.peek()
        const { boundary, progress } = args
        const next = deriveRatio(previous, {
          boundary,
          // @ts-expect-error
          globalRatio: progress[key],
        })

        // DO NOT INVALIDATE the store if the values didn't change
        if (JSON.stringify(next) !== JSON.stringify(previous)) {
          // console.log('set', key)
          store.set(next)
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
