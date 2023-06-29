import { tick } from 'svelte'

const INJECT = (target: HTMLElement, portal: HTMLElement) => {
  target.appendChild(portal)
}
type Props = {
  /**
   * DOM Element or CSS Selector
   */
  target: HTMLElement | string
  /**
   * `target.appendChild(portal)`
   */
  inject?: (target: HTMLElement, portal: HTMLElement) => void
}
/**
 * Usage: <div use:portal={'css selector'}> or <div use:portal={document.body}>
 * @param portalElement
 * @param param1
 * @returns
 */
export function portal(portalElement: HTMLElement, { target = 'body', inject = INJECT }: Props) {
  if (!portalElement.hidden) {
    console.warn(`Portal Element isn't hidden on hydration.`)
  }
  let targetElement: HTMLElement

  async function update(props: Props) {
    target = props.target
    if (typeof target === 'string') {
      // @ts-expect-error
      targetElement = document.querySelector(target)
      if (targetElement === null) {
        await tick()
        // @ts-expect-error
        targetElement = document.querySelector(target)
      }
      if (targetElement === null) {
        throw new Error(`No element found matching css selector: "${target}"`)
      }
    } else if (target instanceof HTMLElement) {
      targetElement = target
    } else {
      throw new TypeError(
        `Unknown portal target type: ${
          target === null ? 'null' : typeof target
        }. Allowed types: string (CSS selector) or HTMLElement.`
      )
    }

    inject(targetElement, portalElement)
  }
  function destroy() {
    if (portalElement.parentNode) {
      portalElement.parentNode.removeChild(portalElement)
    }
  }

  update({ target, inject })
  portalElement.hidden = false
  return {
    update,
    destroy,
  }
}
