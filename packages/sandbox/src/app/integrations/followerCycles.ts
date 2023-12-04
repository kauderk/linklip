import { preSignal } from '$lib/pre-signal'
import { aspectRatioFrom, type resizeMode } from '../Resize.svelte'
import type { FollowerCycle } from '../controller/follower'
import { createDefaultStage } from '../follower/store'

const _Config = {
  width: 350,
  minWidth: 300,
  aspectRatio: [16, 9] as [number, number],
}
export function createConfig(config?: Partial<typeof _Config>) {
  const _config = { ..._Config, ...config }
  const width = _config.width
  const aspectRatio = aspectRatioFrom([..._config.aspectRatio])
  const height = width / aspectRatio.value
  const windowed = typeof window !== 'undefined'
  const offset = 200
  return {
    ..._config,
    aspectRatio,
    // prettier-ignore
    rect: preSignal({
			x: (windowed ? window.innerWidth  / 2 : offset) - width / 2,
			y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
			width,
			height,
		}),
    constraint: {},
    resizing: preSignal(false),
    stage: createDefaultStage(),
    resizeMode: preSignal('inlineBlock' as resizeMode),
  }
}
export const followerCycle = {
  update(hostRef, initRect) {
    return () => {
      // https://stackoverflow.com/q/39417566
      const rect = hostRef.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }
  },
  clean(followerRef) {
    // console.log('styleHost remove offset')

    followerRef?.style.removeProperty('--topOffset')
    followerRef?.style.removeProperty('--leftOffset')
  },
  resize(followerRef, entry, initRect, isFull) {
    if (isFull) {
      this.clean!(followerRef)
      return
    }
    const topOffset = entry.boundingClientRect.top - entry.intersectionRect.top
    const leftOffset = entry.boundingClientRect.left - entry.intersectionRect.left
    // console.log('styleHost add   offset')
    followerRef?.style.setProperty('--topOffset', topOffset + 'px')
    followerRef?.style.setProperty('--leftOffset', leftOffset + 'px')

    return {
      x: entry.intersectionRect.x,
      y: entry.intersectionRect.y,
      width: entry.intersectionRect.width,
      height: entry.intersectionRect.height,
    }
  },
} satisfies FollowerCycle
