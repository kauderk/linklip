import { createMouseTrack } from 'src/app/controller/mouse-track'
import { preSignal, type PreSignal } from './pre-signal'
import { cleanSubscribers } from './stores'

function resize(el: HTMLElement, updater: (entry: ResizeObserverEntry) => void) {
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      //force before update to run;
      updater(entry)
    }
  })

  resizeObserver.observe(el)

  return function destroy() {
    resizeObserver.unobserve(el)
    resizeObserver.disconnect()
  }
}

function resizeSubscription(
  el: HTMLElement,
  [fn, busy]: [fn: (rect: DOMRect) => void, busy?: PreSignal<boolean>]
) {
  function deriveRect(el: HTMLElement) {
    fn(el.getBoundingClientRect())
  }
  deriveRect(el)

  let _busy = busy || preSignal(false)
  const debounced = debounce((el: HTMLElement) => {
    _busy.value = false

    deriveRect(el)
  }, 300)

  return cleanSubscribers(
    resize(el, e => {
      _busy.value = true
      debounced.fn(e.target as HTMLElement)
    }),
    // fallback.destroy,
    debounced.destroy
  )
}

export function updateWindow(
  fn: DebouncedCallback<'resize' | 'wheel'>,
  delay = 300,
  called = false
) {
  if (called) fn(false, new Event('any') as any)
  return cleanSubscribers(
    createDebouncedListener(window, 'resize', fn, delay),
    createDebouncedListener(window, 'wheel', fn, delay)
  )
}

// prettier-ignore
function createListener<K extends keyof GlobalEventHandlersEventMap>(listener: K, fn: (e: GlobalEventHandlersEventMap[K]) => void,el=window) {
	el.addEventListener(listener, fn)
	return () => el.removeEventListener(listener, fn)
}

type x = Parameters<typeof resizeSubscription>
export const resizeAction = (el: x[0], [fn, busy]: x[1]) => {
  return {
    destroy: resizeSubscription(el, [fn, busy]),
  }
}

const debounce = <F extends (...args: any) => void>(func: F, delay: n) => {
  let timer: NodeJS.Timeout

  return {
    destroy() {
      clearTimeout(timer)
    },
    fn: function () {
      // @ts-expect-error
      const context = this
      const args = arguments
      clearTimeout(timer)
      timer = setTimeout(() => func.apply(context, args), delay)
    } as F,
  }
}
// prettier-ignore
type EventCallback<K extends keyof GlobalEventHandlersEventMap> = (e: GlobalEventHandlersEventMap[K]) => void
type DebouncedCallback<K extends keyof GlobalEventHandlersEventMap> = (
  state: boolean,
  e: GlobalEventHandlersEventMap[K]
) => void
// prettier-ignore
export function createDebouncedListener<K extends keyof GlobalEventHandlersEventMap, DB  extends DebouncedCallback<K>>(
	el: HTMLElement | Window,
	listener: K,
	...args: Parameters<typeof debounceOnOff<DB>>
) {
	const debounced = debounceOnOff<DB>(...args)
	// @ts-expect-error
	el.addEventListener(listener, debounced.fn)
	return cleanSubscribers(
		// @ts-expect-error
		() => el.removeEventListener(listener, debounced.fn),
		// fallback.destroy,
		debounced.destroy
	)
}
type DebouncedObserver = (state: boolean, ...e: Parameters<ResizeObserverCallback>) => void
// prettier-ignore
export function createDebouncedObserver(
	el: HTMLElement,
	...args: Parameters<typeof debounceOnOff<DebouncedObserver>>
) {
	const debounced = debounceOnOff<DebouncedObserver>(...args)
	const observer = new ResizeObserver(debounced.fn)
	observer.observe(el)

	return cleanSubscribers(
		() => observer.disconnect(),
		// fallback.destroy,
		debounced.destroy
	)
}

const debounceOnOff = <On extends (state: boolean, ...args: any) => void>(
  on: On,
  delay?: n,
  call?: boolean
) => {
  let timer: NodeJS.Timeout

  // https://stackoverflow.com/a/54607819/13914180
  // prettier-ignore
  type RemoveFirstFromTuple<T extends any[]> = 
		T['length'] extends 0 ? undefined :
		(((...b: T) => void) extends (a:any, ...b: infer I) => void ? I : [])

  return {
    destroy() {
      call = true
      clearTimeout(timer)
    },
    fn: function () {
      clearTimeout(timer)
      // @ts-expect-error
      const context = this
      const args = arguments

      if (!call) {
        on.apply(context, [true, ...args])
      }
      call = true
      timer = setTimeout(() => {
        call = false
        on.apply(context, [false, ...args])
      }, delay || 300)
      // @ts-expect-error
    } as (...args: RemoveFirstFromTuple<Parameters<On>>) => void,
  }
}

export function createTimeout(fn: () => void, ms = 400) {
  const timer = setTimeout(fn, ms)
  return function clear() {
    clearTimeout(timer)
  }
}
