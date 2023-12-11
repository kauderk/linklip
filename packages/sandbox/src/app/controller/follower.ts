import { createContext } from '$lib/create-context'
import { createDebouncedListener, createTimeout } from '$lib/resize'
import { useClass } from '$lib/solid/useDirective'
import { cleanSubscribers } from '$lib/stores'
import { createMouseTrack } from './mouse-track'
// prettier-ignore
import { fitToTarget, mapRange, type FollowerConfig, type PlayerConfig, type Rect, type Selector, togglePointerTarget, animationFrameInterval, type El, createCachedDomObserver } from './follower-lib'
import { createDefaultStage } from '../follower/store'
import { isRendered } from '$lib/utils'
import { createSvelteSignal } from '$lib/solid'

export const followers = createSvelteSignal({ message: '' as 'reset' | '' })
type Props = Pick<PlayerConfig, 'rect' | 'dragging' | 'stage'> &
  FollowerConfig & {
    cachedDomObserver: ReturnType<typeof createCachedDomObserver>
  }

export function follower<F extends Props>(config: Props) {
  const rect = config.rect
  let hostStack = {
    fn: () => {},
    selectorKey: '',
    ref: <El>undefined,
  }
  let dragging = config.dragging ?? createSvelteSignal(false)
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
        matchesSelector(hostRef, sel.selector.target)
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

  function resolveSelector(selector?: Selector) {
    if (typeof selector === 'function') {
      return resolveSelector(selector())
    } else if (typeof selector === 'string') {
      return document.querySelector(selector) as HTMLElement
    } else if (selector instanceof HTMLElement) {
      return selector
    }
  }
  function matchesSelector(against?: HTMLElement, selector?: Selector) {
    return against === resolveSelector(selector)
  }
  function findSelector(el: any) {
    return selectors.find(sel => matchesSelector(el, sel.selector.target))
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
    const newHost = resolveSelector(potential)
    if (!newHost) return
    return newHost
  }
  function tryFindHost(host: HTMLElement) {
    hostStack.selectorKey = selection.tryDock(host)
    // FIXME: abstract stageSignal - createDefaultStage
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

  //#region createRectObserver & createFitToWindow

  // ----
  let destroyFitToWindowFrame = () => {}
  const createFitToWindow = () => {
    destroyFitToWindowFrame = config.cachedDomObserver.tick.$ubscribe(function () {
      observer.disconnect()
      send(fitToTarget({ ...rect.peek() }))
    })
    config.cachedDomObserver.register({ window: true })
  }
  //#endregion

  //#endregion

  let destroyRectObserver = () => {}
  const createRectObserver = () => {
    destroyRectObserver = config.cachedDomObserver.tick.$ubscribe(function () {
      observer.disconnect()
      if (!hostStack.ref) return
      observer.observe(hostStack.ref)
    })
    config.cachedDomObserver.register(getSelector().observerSelectors)
  }
  /**
   * Main Logic
   */
  function branchOutHost(host?: Element) {
    observer.disconnect()

    const tryHost = maybeIsHost(host) ?? maybePanicToRef()
    selection.clean(false)
    getSelector().followerCycle?.clean?.(follower.ref)

    destroyRectObserver()
    destroyFitToWindowFrame()

    if (tryHost) {
      getSelector().styleHost?.(hostStack.ref)

      hostStack.ref = tryFindHost(tryHost)
      createRectObserver()

      getSelector().styleHost?.(hostStack.ref, rect.peek())
      send(getSelector().followerCycle!.update(hostStack.ref, rect.peek(), rect))
      getSelector().postBranch?.()
      observer.observe(hostStack.ref)
    } else {
      const freezeRect = follower.ref.getBoundingClientRect()
      overlay.clean()
      config.hostLess?.postBranch?.()
      createFitToWindow()

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
      // TODO: how do I tell the compiler that once 'host' is set, it will always be set?
      const cycle = getSelector().followerCycle!
      if (!cycle.resize) {
        hostStack.fn()
        return
      }

      const entry = entries[0]
      const ratio = entry.intersectionRatio
      overlay.tryHide(ratio < 0.1)

      if (ratio === 0) {
        return
      }
      const res = cycle.resize(follower.ref, entry, rect.peek(), ratio === 0 || ratio === 1)
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

  let delta = { ...rect.peek() }
  let pointer: { ref?: HTMLElement } = {}
  const trackPointer = createMouseTrack({
    mousedown(e) {
      e.stopPropagation()
      follower.ref.classList.add('pointer') // overrides pointer events from the observer

      // offPointer down
      observer.disconnect()

      // order matters
      const oldRect =
        stage.peek().mode == 'host' ? hostStack.ref?.getBoundingClientRect() : undefined
      const _rect = rect.peek()
      delta = {
        x: e.clientX - _rect.x,
        y: e.clientY - _rect.y,
        width: oldRect?.width || _rect.width,
        height: oldRect?.height || _rect.height,
      }
      // order matters
      selection.clean()
      if (oldRect) {
        getSelector().followerCycle?.clean?.(follower.ref)
      }

      dragging.value = true
    },

    mousemove(e) {
      send(
        fitToTarget({
          ...delta,
          x: e.clientX - delta.x,
          y: e.clientY - delta.y,
        })
      )

      // offPointer update
      if (e.target !== pointer.ref) {
        togglePointerTarget(false, pointer.ref)
        pointer.ref = e.target as any
        const preSelector = selectors.find(sel =>
          matchesSelector(pointer.ref, sel.selector.pointerTarget ?? sel.selector.target)
        )?.selector
        if (preSelector && preSelector.pointer) {
          pointer.ref = preSelector.outline
            ? resolveSelector(preSelector.outline) ?? pointer.ref
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
      const newHost = resolveSelector(config.selectors[target as any]?.selector.target)
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
      if (stage.peek().mode != 'free') {
        this.changeHost(host)
      }

      return cleanSubscribers(
        selection.clean,
        overlay.clean,
        observer.disconnect.bind(observer),
        createTimeout(() => (follower.ref.hidden = false)),
        destroyRectObserver,
        destroyFitToWindowFrame,
        () => {
          // prettier-ignore
          getSelector().styleHost?.(hostStack.ref)
          getSelector().followerCycle?.clean?.(follower.ref)
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
