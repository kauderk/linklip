type on = { on: string | string[] }
export function keydown<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
  node: T,
  params: {
    [key in K]?: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  } & on
) {
  let { on, ...rest } = params

  const keyBoardEvents = Object.entries(rest).map(([type, listener]) => {
    // @ts-expect-error
    node.addEventListener(type, listener)
    return function down(e: KeyboardEvent) {
      const tagName = document.activeElement?.tagName.toLowerCase()
      if (tagName === 'input') return
      if ([on].flat().find(on => on == e.key.toLowerCase())) {
        // @ts-expect-error
        listener()
      }
    }
  })
  Object.values(keyBoardEvents).forEach(listener => {
    window.addEventListener('keydown', listener)
  })

  //window.addEventListener('click',callback)
  return {
    destroy() {
      Object.entries(rest).forEach(([type, listener]) => {
        // @ts-expect-error
        node.removeEventListener(type, listener)
      })
      Object.values(keyBoardEvents).forEach(listener => {
        window.removeEventListener('keydown', listener)
      })
      // @ts-expect-error
      params = rest = undefined
      node.remove()
    },
  } satisfies ActionReturn
}

export const down = <T extends HTMLElement>(
  node: T,
  params: on & { action: (node: T, e: KeyboardEvent) => void }
) => {
  const keydown = (e: KeyboardEvent) => params.action(node, e)
  window.addEventListener('keydown', keydown)
  return {
    destroy() {
      window.removeEventListener('keydown', keydown)
      // @ts-expect-error
      params = undefined
      node.remove()
    },
  } satisfies ActionReturn
}

export interface ActionReturn<Parameter = any> {
  update?: (parameter: Parameter) => void
  destroy?: () => void
}
import type { Action } from 'svelte/types/runtime/action'

// TODO: better abstraction
export function Event<T extends HTMLElement, K extends string>(
  node: T,
  params: {
    // @ts-expect-error
    [key in K]?: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  }
) {
  return {
    destroy: createListeners(node, params),
  } satisfies ActionReturn
}
export function createListeners<T extends HTMLElement, K extends string>(
  node: T,
  params: {
    // @ts-expect-error
    [key in K]?: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  }
) {
  Object.entries(params).map(([type, listener]) => {
    // @ts-expect-error
    node.addEventListener(type, listener)
  })
  return function destroy() {
    Object.entries(params).forEach(([type, listener]) => {
      // @ts-expect-error
      node.removeEventListener(type, listener)
    })
    // @ts-expect-error
    params = undefined
    //node.remove()
  }
}

type Payload<Fun extends (...args: any) => any> = Parameters<Fun>[1]

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      keydown: Payload<typeof keydown>
      down: Payload<typeof down>
      Event: Payload<typeof Event>
    }
  }
}
