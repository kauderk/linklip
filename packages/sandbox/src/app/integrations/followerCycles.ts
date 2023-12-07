import { preSignal } from '$lib/pre-signal'
import { aspectRatioFrom, type resizeMode } from '../Resize.svelte'
import type { FollowerCycle } from '../controller/follower'
import { createDefaultStage } from '../follower/store'

const _Config = {
  width: 350,
  minWidth: 300,
  aspectRatio: [16, 9] as [number, number],
  resizing: false,
  stage: createDefaultStage({ mode: 'host' }).peek(),
  resizeMode: 'inlineBlock' as resizeMode,
  rect: {
    x: 20,
    y: 20,
    width: 350,
    height: 350 / (16 / 9),
  },
}
export function createConfig(config?: Partial<typeof _Config>) {
  const _config = { ..._Config, ...config }
  const aspectRatio = aspectRatioFrom([..._config.aspectRatio])

  const width = _config.width
  const height = width / aspectRatio.value

  const windowed = typeof window !== 'undefined'
  const offset = 200
  return {
    ..._config,
    aspectRatio,
    // prettier-ignore
    rect: preSignal(_config.rect || {
			x: (windowed ? window.innerWidth  / 2 : offset) - width / 2,
			y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
			width,
			height,
		}),
    constraint: {},
    resizing: preSignal(_config.resizing),
    stage: createDefaultStage(_config.stage),
    resizeMode: preSignal(_config.resizeMode),
  }
}
createConfig.serialize = function (self: ReturnType<typeof createConfig>) {
  const { constraint, ...this_ } = self
  return {
    ...this_,
    aspectRatio: self.aspectRatio.tuple as [number, number],
    resizing: self.resizing.peek(),
    rect: self.rect.peek(),
    stage: self.stage.peek(),
    resizeMode: self.resizeMode.peek(),
  } satisfies typeof _Config
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
