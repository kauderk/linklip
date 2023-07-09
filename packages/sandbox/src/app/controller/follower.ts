import { createContext } from '$lib/create-context'
import { preSignal } from '$lib/pre-signal'
import { createDebouncedListener, createDebouncedObserver, createTimeout } from '$lib/resize'
import { useClass } from '$lib/solid/useDirective'
import { cleanSubscribers } from '$lib/stores'
import { useContextMenu } from 'src/context-menu/ContextMenu.svelte'
import { createTrackMouseHold } from './click-track'
import { createMouseTrack } from './mouse-track'
// prettier-ignore
import { fitToTarget, mapRange, type FollowerConfig, type Rect, togglePointerTarget, type Stage, animationFrameInterval, type El } from './follower-lib'
import { createListeners } from '$lib/event-life-cycle'

export const followers = preSignal({ message: '' as 'reset' | '' })
export function follower(config: FollowerConfig) {
  const rect = config.rect
  let hostStack = {
    fn: () => {},
    selectorKey: '',
    ref: <El>undefined,
  }
  let dragging = config.dragging ?? preSignal(false)
  let stage = config.stage ?? (preSignal({ mode: 'free' }) as Stage)
  let follower = { ref: <HTMLElement>{} }

  //#region methods
  function send(props: {
    value: (() => Rect) | Rect
    mode: 'new' | 'clear' | 'update'
    canIntersect?: boolean
  }) {
    const { value, mode } = props
    const selector = getSelector()
    const newRect = () => (typeof value === 'function' ? value() : value)
    const postRect = () => {
      const canIntersect = selector.canIntersect ?? props.canIntersect
      if (!canIntersect) {
        return fitToTarget(newRect())
      }
      return newRect()
    }

    if (mode == 'new') {
      hostStack.fn = () => rect.set(postRect())
    } else if (mode == 'update') {
      rect.set(postRect())
    }
  }

  //#region branch cycle
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
  //#endregion

  //#region find host
  function getSelector() {
    return config.selectors[hostStack.selectorKey] ?? {}
  }
  const selectors = Object.values(config.selectors)
  const parseSelector = (sel: any): string => (typeof sel == 'string' ? sel : sel.selector)
  function isHost(el?: Element): el is HTMLElement {
    return selectors.some(sel => el?.matches(parseSelector(sel)))
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
  //#endregion

  //#region createRectObserver
  const animationFrame = animationFrameInterval(() => {
    observer.disconnect()
    if (!hostStack.ref) return
    observer.observe(hostStack.ref)
  })
  let destroyRectObserver = () => {}
  // prettier-ignore
  const createRectObserver = () => {
    if (getSelector().canIntersect === false) return

    const selectors = getSelector().observerSelectors
    const resize = selectors?.resize ? document.querySelector(selectors.resize) : (null as any)
    const scroll = selectors?.scroll ? document.querySelector(selectors.scroll) : (null as any)

		const debounced = animationFrame.debounced
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
  //#endregion

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

  const observer = new IntersectionObserver(
    entries => {
      if (stage.peek().mode !== 'host') return
      if (getSelector().canIntersect === false) {
        hostStack.fn()
        return
      }

      const entry = entries[0]
      const ratio = entry.intersectionRatio
      overlay.tryHide(ratio < 0.1)

      if (ratio === 0) {
        return
      }
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
    },

    mouseup(e) {
      follower.ref.classList.remove('pointer')

      if (getSelector().panicToLastHost && isHost(hostStack.ref)) {
        branchOutHost(hostStack.ref)
      }
      dragging.value = false
    },
  })

  //#region context menu
  const contextMenuSelectorNodes = Object.entries(config.selectors).map(([key, value]) => {
    return {
      content: key,
      callback() {
        const newHost = document.querySelector(value.selector)
        if (!newHost) return
        branchOutHost(newHost)
      },
      action(ref: HTMLElement) {
        const hover = (toggle: boolean) => () =>
          document.querySelector(value.selector)?.classList.toggle('follower-outline', toggle)

        return {
          destroy: cleanSubscribers(
            createListeners(ref, {
              mouseenter: hover(true),
              mouseleave: hover(false),
            }),
            hover(false)
          ),
        }
      },
    }
  })
  if (config.pictureInPicture) {
    contextMenuSelectorNodes.unshift(<any>{
      content: 'Picture In Picture',
      callback() {
        branchOutHost(undefined)
      },
    })
  }
  //#endregion

  return {
    dragThreshold: createTrackMouseHold({
      threshold: trackPointer,
      hold(e) {
        useContextMenu(e, { nodes: contextMenuSelectorNodes }, true)
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
      branchOutHost(host)

      return cleanSubscribers(
        selection.clean,
        overlay.clean,
        observer.disconnect.bind(observer),
        createTimeout(() => (follower.ref.hidden = false)),
        animationFrame.clearTimers,
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

export const { getFollowerContext, setFollowerContext } = createContext({
  follower,
})

export * from './follower-lib'
