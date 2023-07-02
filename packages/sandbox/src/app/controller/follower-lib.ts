import { createContext } from '$lib/create-context'
import type { PreSignal } from '$lib/pre-signal'
import type { follower } from './follower'
export type FollowerConfig = Omit<Config, 'aspectRatio'>
export type Config = {
  width: number
  aspectRatio: [number, number]
  selectors: Record<
    string,
    {
      selector: string
      observerSelectors?: {
        resize?: string
        scroll?: string
        window?: boolean
      }
      followerCycle: FollowerCycle
      canIntersect?: boolean
      styleHost?: (hostRef?: HTMLElement, rect?: Rect) => void
      panicToLastHost?: boolean
      tryFindHost?: (hostRef: HTMLElement) => Element | null | undefined
    }
  >
  rect: PreSignal<Rect>
  dragging?: PreSignal<boolean>
  stage?: Stage
}
export type Stage = PreSignal<{
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}>

export type El = HTMLElement | undefined
type Send = ReturnType<typeof follower>['sendType']
export type FollowerCycle = {
  update: (hostRef: HTMLElement, initRect: Rect) => Send
  resize: (
    followerRef: El,
    entry: IntersectionObserverEntry,
    initRect: Rect,
    isFull: boolean
  ) => Send | undefined
  clean?: (followerRef: El) => void
}

export function mapRange(input: number) {
  const intervals = []
  for (let i = 0; i <= 100; i += input) {
    intervals.push(i / 100)
  }
  return intervals
}
export type Rect = {
  x: number
  y: number
  width: number
  height: number
}
export function fitToTarget(_rect: Rect) {
  // avoid going out of the screen
  if (_rect.x < 0) _rect.x = 0
  if (_rect.y < 0) _rect.y = 0
  if (_rect.x + _rect.width > window.innerWidth) _rect.x = window.innerWidth - _rect.width
  if (_rect.y + _rect.height > window.innerHeight) _rect.y = window.innerHeight - _rect.height
  return _rect
}

export function togglePointerTarget(on: boolean, el?: HTMLElement) {
  toggleStyle('outline', '10px solid blue', on, el)
}
export function toggleStyle(key: string, value: string, add: boolean, el?: HTMLElement) {
  // store the value plus the state
  if (add) {
    const current = el?.style.getPropertyValue(key)
    const store = current ? current + '_original' : '_unset'
    el?.style.setProperty(`--stored-${key}`, store)
    el?.style.setProperty(key, value)
  }
  // restore the original value or remove it if it was unset
  else {
    const stored = el?.style.getPropertyValue(`--stored-${key}`)
    const [store, state] = (stored || '').split('_')
    if (state == 'original') {
      el?.style.setProperty(key, store)
    } else if (state == 'unset') {
      el?.style.removeProperty(key)
    }
    el?.style.removeProperty(`--stored-${key}`)
  }
}

export function animationFrameInterval(callback: () => any) {
  let framing: any, interval: any
  const clearTimers = () => {
    clearInterval(interval)
    cancelAnimationFrame(framing)
    framing = interval = undefined
  }

  function debounced(on: boolean, ...args: any) {
    if (on && interval === undefined) {
      interval = setInterval(() => {
        framing = requestAnimationFrame(callback)
      }, 0)
    } else {
      callback()
      clearTimers()
    }
  }
  return {
    debounced,
    clearTimers,
  }
}
