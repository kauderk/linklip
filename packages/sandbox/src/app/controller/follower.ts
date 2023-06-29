import { createContext } from '$lib/create-context'
import { preSignal, type PreSignal } from '$lib/pre-signal'
import { createDebouncedListener, createDebouncedObserver, createTimeout } from '$lib/resize'
import { useClass } from '$lib/solid/useDirective'
import { cleanSubscribers } from '$lib/stores'
import { useContextMenu } from 'src/context-menu/ContextMenu.svelte'
import { createTrackMouseHold } from './click-track'
import { createMouseTrack } from './mouse-track'

export const followers = preSignal({ message: '' as 'reset' | '' })
export function follower(config: FollowerConfig) {
  const rect = config.rect
  // console.log('init', rect.value)
  let hostStack = {
    fn: () => {},
    selectorKey: '',
    ref: <El>undefined,
    id: '',
  }
  let dragging = config.dragging ?? preSignal(false)
  let stage = config.stage ?? (preSignal({ mode: 'free' }) as Stage)
  let follower = { ref: <HTMLElement>{} }

  //#region methods
  function getSelector() {
    return config.selectors[hostStack.selectorKey] ?? {}
  }
  function send(props: {
    value: (() => Rect) | Rect
    mode: 'new' | 'clear' | 'update'

    canIntersect?: boolean
  }) {
    const { value, mode } = props
    const selector = getSelector()

    const newRect = () => (typeof value === 'function' ? value() : value)
    if (isNaN(newRect().width)) {
      console.error('NaN follower Rect', newRect())
      return
    }
    const preRect = (bounded?: b) => (!bounded ? fitToTarget(newRect()) : newRect())
    const postRect = () => {
      const canIntersect = selector.canIntersect ?? props.canIntersect
      return preRect(canIntersect)
    }

    if (mode == 'new') {
      hostStack.fn = () => rect.set(postRect())
    } else if (mode == 'update') {
      rect.set(postRect())
    }
  }
  const overlay = {
    clean() {
      follower.ref.style.removeProperty('opacity')
      follower.ref.style.removeProperty('pointer-events')
    },
    tryHide(hidden: boolean) {
      if (dragging.peek()) return
      follower.ref?.style.setProperty('opacity', hidden ? '0' : '1')
      follower.ref?.style.setProperty('pointer-events', hidden ? 'none' : 'unset')
    },
  }
  const selectors = Object.values(config.selectors)
  const parseSelector = (sel: any): string => (typeof sel == 'string' ? sel : sel.selector)
  function isHost(el?: Element): el is HTMLElement {
    return selectors.some(sel => el?.matches(parseSelector(sel)))
  }
  const selection = {
    clean() {
      hostStack.ref?.style.removeProperty('--selector')
      stage.set({ mode: 'free' })
    },
    tryDock(hostRef: HTMLElement) {
      const selector = Object.entries(config.selectors).find(([_, sel]) =>
        hostRef.matches(parseSelector(sel))
      )![0]
      hostRef.style.setProperty('--selector', selector)
      return selector
    },
    mode(mode: boolean) {
      stage.set({
        mode: mode ? 'host' : 'free',
        selector: hostStack.selectorKey,
      })
    },
  }
  function findHost(host?: Element) {
    if (isHost(host)) {
      return host
    } else if (getSelector().panicToLastHost && isHost(hostStack.ref)) {
      return hostStack.ref
    }
  }
  function tryFindHost(host: HTMLElement) {
    hostStack.selectorKey = selection.tryDock(host)
    const selector = getSelector()
    if (selector.tryFindHost) {
      const pre = selector.tryFindHost(host) as El
      if (isHost(pre)) {
        hostStack.selectorKey = selection.tryDock(pre)
        return pre
      } else {
        return host
      }
    } else {
      return host
    }
  }

  //#region createRectObserver
  let destroyRectObserver = () => {}
  const createRectObserver = () => {
    if (getSelector().canIntersect === false) return

    const selectors = getSelector().observerSelectors
    const resize = selectors?.resize ? document.querySelector(selectors.resize) : (null as any)
    const scroll = selectors?.scroll ? document.querySelector(selectors.scroll) : (null as any)

    const potentialObservers = [
      selectors?.window !== false ? createDebouncedListener(window, 'resize', debounced) : null,
      scroll ? createDebouncedListener(scroll, 'scroll', debounced) : null,
      resize ? createDebouncedObserver(resize, debounced) : null,
    ]
    destroyRectObserver = cleanSubscribers(
      // @ts-expect-error
      ...potentialObservers.filter(Boolean)
    )
  }
  let framing: any, interval: any
  const clearTimers = () => {
    clearInterval(interval)
    cancelAnimationFrame(framing)
    framing = interval = undefined
  }
  const followCurrent = () => {
    observer.disconnect()
    if (!hostStack.ref) return
    observer.observe(hostStack.ref)
  }
  function debounced(on: boolean) {
    // console.log('debounced', arguments)
    if (on && interval === undefined) {
      interval = setInterval(() => {
        framing = requestAnimationFrame(followCurrent)
      }, 0)
    } else {
      followCurrent()
      clearTimers()
    }
  }
  //#endregion

  /**
   * Main Logic
   */
  function branchOutHost(host?: Element) {
    observer.disconnect()

    const tryHost = findHost(host)
    selection.clean()
    getSelector().followerCycle?.clean?.(follower.ref)
    destroyRectObserver()

    if (tryHost) {
      getSelector().styleHost?.(hostStack.ref)

      hostStack.ref = tryFindHost(tryHost)
      createRectObserver()

      getSelector().styleHost?.(hostStack.ref, rect.peek())
      send(getSelector().followerCycle.update(hostStack.ref, rect.peek()))
      observer.observe(hostStack.ref)
    } else {
      const freezeRect = follower.ref.getBoundingClientRect()
      overlay.clean()

      send({
        value: () => ({
          ...rect.peek(),
          x: freezeRect.x,
          y: freezeRect.y,
        }),
        mode: 'new',
      })
    }
    selection.mode(!!tryHost)
  }
  //#endregion

  let intersectionRatio = 0
  const observer = new IntersectionObserver(
    entries => {
      if (stage.peek().mode !== 'host') return
      if (getSelector().canIntersect === false) {
        hostStack.fn()
        return
      }

      const entry = entries[0]
      const ratio = (intersectionRatio = entry.intersectionRatio)
      overlay.tryHide(ratio < 0.1)

      if (ratio === 0) {
        return
      }
      // console.log('resize', ratio)
      const res = getSelector().followerCycle.resize(
        follower.ref,
        entry,
        rect.peek(),
        ratio === 0 || ratio === 1
      )
      if (!res) {
        hostStack.fn()
        return
      }

      send(res)
    },
    {
      threshold: mapRange(3),
    }
  )

  let delta = { x: 0, y: 0 }
  let pointer: { ref?: HTMLElement } = {}
  const trackPointer = createMouseTrack({
    mousedown(e) {
      e.stopPropagation()
      follower.ref.classList.add('pointer') // overrides pointer events from the observer

      // offPointer down
      observer.disconnect()

      const oldRect = follower.ref.getBoundingClientRect()
      delta.x = e.clientX - oldRect.left
      delta.y = e.clientY - oldRect.top
      dragging.value = true
    },

    mousemove(e) {
      const old = rect.peek()
      send({
        value: {
          width: old.width,
          height: old.height,
          x: e.clientX - delta.x,
          y: e.clientY - delta.y,
        },
        mode: 'update',
      })

      // offPointer update
      if (e.target !== pointer.ref) {
        togglePointerTarget(false, pointer.ref)
        pointer.ref = e.target as any
        if (isHost(pointer.ref)) {
          togglePointerTarget(true, pointer.ref)
        }
      }
    },

    mouseup(e) {
      // offPointer up
      togglePointerTarget(false, pointer.ref)
      pointer.ref = undefined
      follower.ref.classList.remove('pointer')

      branchOutHost(e.target as any)
      dragging.value = false
    },
  })

  return {
    dragThreshold: createTrackMouseHold({
      threshold: trackPointer,
      hold(e) {
        useContextMenu(
          e,
          {
            nodes: [
              {
                content: 'Resize',
                callback(openState) {
                  // console.log(openState)
                },
              },
            ],
          },
          true
        )
      },
    }),
    registerFollower(ref: HTMLElement) {
      follower.ref = ref
      return {
        destroy: cleanSubscribers(
          useClass(ref, { dragging }).destroy,
          rect.subscribe(rect => {
            if (isNaN(rect.width)) {
              return
            }
            ref.style.left = rect.x + 'px'
            ref.style.top = rect.y + 'px'
            ref.style.width = rect.width + 'px'
            ref.style.height = rect.height + 'px'
          }),
          createDebouncedListener(window, 'wheel', debounced => {
            ref.style.pointerEvents = debounced ? 'none' : 'unset'
          }),
          followers.subscribe(state => {
            if (state.message == 'reset') {
              branchOutHost()
            }
            // don't invalidate the state
            state.message = ''
          })
        ),
      }
    },
    styleHost() {
      getSelector().styleHost?.(hostStack.ref, rect.peek())
    },
    mount(host?: Element) {
      // FIXME:
      // @ts-expect-error
      hostStack.id = host.parentNode.href
      branchOutHost(host)

      return cleanSubscribers(
        selection.clean,
        overlay.clean,
        observer.disconnect.bind(observer),
        createTimeout(() => (follower.ref.hidden = false)),
        clearTimers,
        destroyRectObserver,
        () => {
          // prettier-ignore
          getSelector().styleHost?.(hostStack.ref)
          getSelector().followerCycle.clean?.(follower.ref)
          pointer = {}
          follower = {} as any
          hostStack = {} as any
        }
      )
    },
    sendType: <Parameters<typeof send>[0]>{},
  }
}

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
type Stage = PreSignal<{
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}>

type El = HTMLElement | undefined
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

export const { getFollowerContext, setFollowerContext } = createContext({
  follower,
})
function mapRange(input: number) {
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
function fitToTarget(_rect: Rect) {
  // avoid going out of the screen
  if (_rect.x < 0) _rect.x = 0
  if (_rect.y < 0) _rect.y = 0
  if (_rect.x + _rect.width > window.innerWidth) _rect.x = window.innerWidth - _rect.width
  if (_rect.y + _rect.height > window.innerHeight) _rect.y = window.innerHeight - _rect.height
  return _rect
}

function togglePointerTarget(on: boolean, el?: HTMLElement) {
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
