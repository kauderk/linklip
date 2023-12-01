import { createContext } from '$lib/create-context'
import { preSignal } from '$lib/pre-signal'
import { createDebouncedListener, createDebouncedObserver, createTimeout } from '$lib/resize'
import { useClass } from '$lib/solid/useDirective'
import { cleanSubscribers } from '$lib/stores'
import { useContextMenu } from '../../context-menu/ContextMenu.svelte'
import { createTrackMouseHold } from './click-track'
import { createMouseTrack } from './mouse-track'
// prettier-ignore
import { fitToTarget, mapRange, type FollowerConfig, type PlayerConfig, type Rect, togglePointerTarget, type Stage, animationFrameInterval, type El, camelCaseToTitleCase } from './follower-lib'
import { createListeners } from '$lib/event-life-cycle'
import { createDefaultStage } from '../follower/store'
import { isRendered } from '$lib/utils'

export const followers = preSignal({ message: '' as 'reset' | '' })
type Props = Pick<PlayerConfig, 'rect' | 'dragging' | 'stage'> & FollowerConfig
export function follower<F extends Props>(config: Props) {
  const rect = config.rect
  let hostStack = {
    fn: () => {},
    selectorKey: '',
    ref: <El>undefined,
  }
  let dragging = config.dragging ?? preSignal(false)
  let stage = config.stage ?? createDefaultStage()
  let follower = { ref: <HTMLElement>{} }

  //#region methods
  function send(value: (() => Rect) | Rect) {
    const newRect = () => (typeof value === 'function' ? value() : value)

    if (typeof value === 'function') {
      hostStack.fn = () => rect.set(newRect())
    } else {
      rect.set(newRect())
    }
  }

  //#region branch cycle
  const overlay = {
    clean() {
      // console.log('overlay clean')
      follower.ref.style.removeProperty('opacity')
      follower.ref.style.removeProperty('pointer-events')
    },
    tryHide(hidden: boolean) {
      if (dragging.peek()) return
      // console.log('overlay tryHide', hidden)
      follower.ref?.style.setProperty('opacity', hidden ? '0' : '1')
      follower.ref?.style.setProperty('pointer-events', hidden ? 'none' : 'unset')
    },
  }
  const selection = {
    clean(reset = true) {
      // hostStack.ref?.style.removeProperty('--selector')
      delete follower.ref.dataset.follower
      reset && stage.mod({ mode: 'free' })
    },
    tryDock(hostRef: HTMLElement) {
      const selector = Object.entries(config.selectors).find(([_, sel]) =>
        isSelector(hostRef, sel)
      )![0]
      // console.log('selection tryDock', selector)
      // hostRef.style.setProperty('--selector', selector) // React won't remove it
      follower.ref.dataset.follower = selector
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
  type Sel = FollowerConfig['selectors'][string] | string
  const parseSelector = (sel: Sel): string => (typeof sel == 'string' ? sel : sel.selector.target)
  function isSelector(el: Element | undefined, sel: Sel) {
    return el?.matches(parseSelector(sel))
  }
  function findSelector(el: any) {
    return selectors.find(sel => isSelector(el, sel))
  }
  function maybeIsHost(el?: Element) {
    return findSelector(el) ? <HTMLElement>el : undefined
  }
  function maybeUsePointer(el: any) {
    return findSelector(el)?.selector.pointer ? el : undefined
  }
  function maybePanicToRef() {
    return getSelector().selector?.panicToLast && maybeIsHost(hostStack.ref)
      ? hostStack.ref
      : undefined
  }
  function tryHost(target?: string) {
    const potential = config.selectors[target as any]?.selector.target
    if (!potential) return
    const newHost = document.querySelector(potential) as HTMLElement
    if (!newHost) return
    return newHost
  }
  function tryFindHost(host: HTMLElement) {
    hostStack.selectorKey = selection.tryDock(host)
    // FIXME: abstract stageSignal¿
    // const selector = getSelector()
    // if (selector.stageSignal) {
    //   let pre = tryHost(selector.stageSignal.peek().selector)
    //   pre = maybeIsHost(pre)
    //   if (pre) {
    //     hostStack.selectorKey = selection.tryDock(pre)
    //     return pre
    //   } else {
    //     return host
    //   }
    // } else {
    return host
    // }
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
    const selectors = getSelector().observerSelectors
    const resize = selectors?.resize ? document.querySelector(selectors.resize) : (null as any)
    const scroll = selectors?.scroll ? document.querySelector(selectors.scroll) : (null as any)

		const debounced = animationFrame.debounced
    const potentialObservers = [
      selectors?.window !== false ? createDebouncedListener(window, 'resize', debounced) : null,
      scroll ? createDebouncedListener(scroll, 'scroll', debounced) : null,
      resize ? createDebouncedObserver(resize, debounced, 300, true) : null,
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

    const tryHost = maybeIsHost(host) ?? maybePanicToRef()
    selection.clean(false)
    getSelector().followerCycle?.clean?.(follower.ref)
    destroyRectObserver()

    if (tryHost) {
      getSelector().styleHost?.(hostStack.ref)

      hostStack.ref = tryFindHost(tryHost)
      createRectObserver()

      getSelector().styleHost?.(hostStack.ref, rect.peek())
      send(getSelector().followerCycle.update(hostStack.ref, rect.peek(), rect))
      getSelector().postBranch?.()
      observer.observe(hostStack.ref)
    } else {
      const freezeRect = follower.ref.getBoundingClientRect()
      overlay.clean()
      config.hostLess?.postBranch?.()

      send(() => ({
        ...rect.peek(),
        x: freezeRect.x,
        y: freezeRect.y,
      }))
    }
    selection.mode(!!tryHost)
  }
  async function preBranch(key = '') {
    const s = stage.peek()
    // deselect current
    await config.selectors[s.selector ?? '']?.preBranch?.({
      current: s.selector,
      next: key,
      selected: false,
    })
    // select new
    await config.selectors[key]?.preBranch?.({
      current: s.selector,
      next: key,
      selected: true,
    })
  }
  function branch(host?: Element | (() => Element | undefined), key?: string) {
    return preBranch(key).then(() => branchOutHost(typeof host === 'function' ? host() : host))
  }
  // FIXME: extract the logic for when it's visible or not
  // performance should increase then

  const observer = new IntersectionObserver(
    entries => {
      if (stage.peek().mode !== 'host' || !isRendered(hostStack.ref!)) {
        return
      }
      const selector = getSelector()
      if (!selector.followerCycle.resize) {
        hostStack.fn()
        return
      }

      const entry = entries[0]
      const ratio = entry.intersectionRatio
      overlay.tryHide(ratio < 0.1)

      if (ratio === 0) {
        return
      }
      const res = selector.followerCycle.resize(
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
      send(
        fitToTarget({
          width: old.width,
          height: old.height,
          x: e.clientX - delta.x,
          y: e.clientY - delta.y,
        })
      )

      // offPointer update
      if (e.target !== pointer.ref) {
        togglePointerTarget(false, pointer.ref)
        pointer.ref = e.target as any
        const preSelector = selectors.find(sel =>
          pointer.ref?.matches?.(sel.selector.pointerTarget ?? sel.selector.target)
        )?.selector
        if (preSelector && preSelector.pointer) {
          pointer.ref = preSelector.outline
            ? document.querySelector(preSelector.outline) ?? pointer.ref
            : (pointer.ref as any)
          togglePointerTarget(true, pointer.ref)
        }
      }
    },

    mouseup(e) {
      // offPointer up
      togglePointerTarget(false, pointer.ref)
      follower.ref.classList.remove('pointer')

      const maybeHost = maybeUsePointer(pointer.ref) ?? maybePanicToRef()
      pointer.ref = undefined

      branch(maybeHost)

      dragging.value = false
    },
  })

  type Targets = keyof F['selectors']
  return {
    innerApi: {
      trackPointer,
      preBranch,
      branchOutHost,
      branch,
      resolveSelector,
    },
    registerFollower(ref: HTMLElement) {
      follower.ref = ref
      return {
        destroy: cleanSubscribers(
          useClass(ref, { dragging }).destroy,
          rect.subscribe(rect => {
            if (isNaN(rect.width)) {
              console.log('rect.width is NaN', rect)
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
              branch()
            }
            // don't invalidate the state
            state.message = ''
          })
        ),
      }
    },
    styleHost(addStyles = true) {
      getSelector().styleHost?.(hostStack.ref, addStyles ? rect.peek() : undefined)
    },
    trySwitchHost(target?: Targets) {
      const potential = config.selectors[target as any]?.selector.target
      if (!potential) return
      const newHost = document.querySelector(potential)
      if (!newHost) return
      branch(newHost)
      return true
    },
    changeHost(host?: Element | Targets) {
      if (typeof host === 'string') {
        this.trySwitchHost(host)
      } else if (host) {
        branch(host as any)
      }
    },
    mount(host?: Element | Targets) {
      this.changeHost(host)

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
