import { preSignal } from '$lib/pre-signal'
// @ts-ignore
import { type resizeMode, aspectRatioFrom } from '../Resize.svelte'
import type { FollowerCycle } from '../controller/follower'
import { createDefaultStage } from '../follower/store'
import { createSerializableStore } from './serializable'

export const _Config = {
  width: 350,
  minWidth: 300,
  aspectRatio: {
    value: [16, 9] as [number, number],
    decorator: aspectRatioFrom,
    serialize: (value: ReturnType<typeof aspectRatioFrom>) => value.tuple,
  },
  resizing: {
    value: false,
    decorator: preSignal,
  },
  stage: {
    value: createDefaultStage({ mode: 'host' }).peek(),
    decorator: createDefaultStage,
  },
  resizeMode: {
    value: 'inlineBlock' as resizeMode,
    decorator: preSignal,
  },
  // FIXME: infer "this" type to non-functions or pure values for the derived functions
  // derived functions will execute after the pure values
  rect(pure: any) {
    const windowed = typeof window !== 'undefined'
    const offset = 200
    return {
      value(override: any) {
        const max = (...args: any[]) => Math.max(...args.map(v => Number(v) ?? 0))
        const width = max(pure.width, pure.minWidth, override.width)
        const height = max(width / pure.aspectRatio.value, override.height)
        return {
          x: max((windowed ? window.innerWidth / 2 : offset) - width / 2, override.x),
          y: max((windowed ? window.innerHeight / 2 : offset) - height / 2, override.y),
          width,
          height,
        }
      },
      decorator: preSignal,
    }
  },
}

export const createConfig = createSerializableStore(_Config)

/**
// type inference across packages is not great
const testTypes = createConfig()
//     ^?
testTypes.serialize().rect.height
//                         ^?
testTypes.width
//        ^?
testTypes.aspectRatio.serialize()
//        ^?
testTypes.rect.serialize()
//              ^?
testTypes.stage.serialize()
//              ^?
// @ts-ignore package types bug?
// prettier-ignore
testTypes.stage.mode;
//              ^?
testTypes.stage.peek()
//              ^?
testTypes.stage.value
//              ^?
testTypes.resizeMode.serialize()
//                   ^?
testTypes.resizeMode.peek()
//                   ^?
//*/

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
