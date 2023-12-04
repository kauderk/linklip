import type { PreSignal } from '$lib/pre-signal'
import type { StageSignal } from '../follower/store'
import type { follower } from './follower'
import { createObservable } from '$lib/pre-signal'
import { createDebouncedListener, createDebouncedObserver } from '$lib/resize'
import { cleanSubscribers } from '$lib/stores'

export type PlayerConfig = {
  width: number
  aspectRatio: [number, number]
  rect: PreSignal<Rect>
  dragging?: PreSignal<boolean>
  stage?: Stage
}
export type Selector =
  | string
  | (() => string | undefined)
  | (() => HTMLElement | undefined)
  | HTMLElement
export type FollowerConfig = {
  selectors: Record<
    string,
    {
      selector: {
        target: Selector
        pointerTarget?: Selector
        outline?: Selector
        pointer?: boolean
        panicToLast?: boolean
      }
      observerSelectors?: {
        resize?: string | string[]
        scroll?: string | string[]
        window?: boolean
      }
      followerCycle: FollowerCycle
      styleHost?: (hostRef?: HTMLElement, rect?: Rect) => void
      constraint?: (hostRef: HTMLElement) => Rect
      stageSignal?: StageSignal
      preBranch?: (payload: {
        current?: string
        next: string
        selected: boolean
      }) => void | Promise<void>
      postBranch?: () => void
    }
  >
  hostLess?: {
    postBranch?: () => void
  }
}
export type Stage = PreSignal<{
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}>

export type El = HTMLElement | undefined
type Send = ReturnType<typeof follower>['sendType']
export type FollowerCycle = {
  update: (hostRef: HTMLElement, initRect: Rect, initRectSignal: PreSignal<Rect>) => Send
  resize?: (
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
    if ('_unset' !== el?.style.getPropertyValue(`--stored-${key}`)) {
      const current = el?.style.getPropertyValue(key)
      const store = current ? current + '_original' : '_unset'
      el?.style.setProperty(`--stored-${key}`, store)
    }
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

export function animationFrameInterval<Args extends Array<any>>(
  callback: (on: boolean, ...args: Args) => void,
  Interval = 0
) {
  let framing: any, interval: any
  const clearTimers = () => {
    clearInterval(interval)
    cancelAnimationFrame(framing)
  }

  function switchAnimation(on: boolean, ...args: Args) {
    clearTimers()
    const Args = [on, ...args] as any
    if (on && interval === undefined) {
      callback.apply(null, Args)
      interval = setInterval(() => {
        framing = requestAnimationFrame(() => callback.apply(null, Args))
      }, Interval)
    } else {
      callback.apply(null, Args)
      interval = undefined
    }
  }
  return {
    switchAnimation,
    clearTimers,
  }
}

export function camelCaseToTitleCase(camel: string) {
  return camel.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const cache = {
  resize: [] as HTMLElement[],
  scroll: [] as HTMLElement[],
}

export function createCachedDomObserver(options?: { cache?: typeof cache }) {
  const tick = createObservable()
  const animationFrame = animationFrameInterval(tick.notify, 0)
  let potentialObservers: (() => void)[] = []
  let _cache = options?.cache ?? cache

  return {
    tick,
    destroy() {
      animationFrame.clearTimers()
      cleanSubscribers(...potentialObservers)()
    },
    register(observerSelectors?: FollowerConfig['selectors'][string]['observerSelectors']) {
      if (!observerSelectors) return

      const selectors = observerSelectors ?? {}
      const switchAnim = animationFrame.switchAnimation

      if (selectors?.window !== false) {
        tryRegisterListener(
          'resize',
          _ => createDebouncedListener(window, 'resize', switchAnim),
          window as any
        )
      }

      annoyingAbstraction('scroll', el => createDebouncedListener(el, 'scroll', switchAnim))
      annoyingAbstraction('resize', el => createDebouncedObserver(el, switchAnim, 300, true))

      function tryRegisterListener(accessor: A, listenerCb: F, el: HTMLElement) {
        const elementWasRegistered = _cache?.[accessor].includes(el)

        if (!elementWasRegistered) {
          const stopListening = listenerCb(el)

          _cache = {
            ..._cache,
            // push the element
            [accessor]: [_cache?.[accessor] ?? [], el].flat(),
          }

          potentialObservers.push(stopListening)
        }
      }

      //#region annoyingAbstraction
      type F = (el: HTMLElement) => () => void
      type A = 'resize' | 'scroll'
      function annoyingAbstraction(accessor: A, listenerCb: F) {
        ;[selectors[accessor] ?? []].flat().map(s => {
          const el = document.querySelector(s) as HTMLElement
          if (!el) return

          tryRegisterListener(accessor, listenerCb, el)
        })
      }
      //#endregion
    },
  }
}
