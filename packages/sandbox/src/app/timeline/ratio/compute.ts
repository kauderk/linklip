import { createSvelteSignal } from '$lib/solid'
import { mapRatio } from './map'

//#region Ratio
export const _boundary_ = {
  startRatio: 0,
  endRatio: 0.1,
}

export const createRelativeRatio = () =>
  createSvelteSignal({
    ratio: 0,
    playing: false,
  })
export const createRatioBoundary = () => createSvelteSignal({ ..._boundary_ })
export const createTiles = () => createSvelteSignal(mapTiles({ ..._boundary_ }))
export type Boundary = ReturnType<typeof createRatioBoundary>

export function deriveRatio<T>(
  store: T,
  deriveOn: { boundary: typeof _boundary_; globalRatio: n }
) {
  const boundary = deriveOn.boundary
  const startRatio = boundary.startRatio || 0
  const endRatio = boundary.endRatio || 1
  const globalRatio = deriveOn.globalRatio
  const playing = globalRatio >= startRatio && globalRatio <= endRatio

  if (playing) {
    const ratio = mapRatio(startRatio, globalRatio, endRatio)
    return { ratio, playing }
  }
  return { ...store, playing }
}
//#endregion

//#region storyboard
import { high as storyboard } from '$mock/storyboard.json'
import type { Progress } from '../scrubber'
const slot = storyboard.slot

const getCount = (percentage: n) => Math.floor(slot.thumbnailCount * percentage)
export const mapTiles = (boundary: typeof _boundary_) => {
  const { startRatio, endRatio } = boundary

  const spanPercentage = (endRatio || 1) - startRatio
  return {
    size: getCount(spanPercentage) + 2, // MaGicNuMbEr
    offsetCount: getCount(startRatio),
  }
}
//#endregion
