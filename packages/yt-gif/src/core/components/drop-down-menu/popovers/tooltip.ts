import Tooltip from './TooltipFromAction.svelte'

export function tooltipAction(element: HTMLElement, props: { tooltip?: s; 'data-tooltip'?: s }) {
  let tooltip = props.tooltip ?? props['data-tooltip']
  let components: Tooltip[] = []
  function mouseOver(event: MouseEvent) {
    if (!tooltip || (element.matches(':hover') && components[0])) return
    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    // remember to set it back on `mouseleave`
    // element.removeAttribute(tooltipAttributeName)

    components.push(
      new Tooltip({
        props: {
          title: tooltip,
          ...cords(event),
        },
        target: document.body,
      })
    )
  }
  function mouseMove(event: MouseEvent) {
    components[0]?.$set(cords(event))
  }
  function cords(event: MouseEvent) {
    const rect = element.getBoundingClientRect()
    return {
      x: event.pageX,
      y: event.pageY,
    }
  }

  async function mouseLeave() {
    for (const component of components) {
      component?.$destroy?.()
    }
    components = []

    // NOTE: restore the `title` attribute
    // element.setAttribute(tooltipAttributeName, tooltip)
  }

  element.addEventListener('mouseover', mouseOver)
  element.addEventListener('mouseleave', mouseLeave)
  //element.addEventListener('mousemove', mouseMove)

  return {
    destroy() {
      element.removeEventListener('mouseover', mouseOver)
      element.removeEventListener('mouseleave', mouseLeave)
      element.removeEventListener('mousemove', mouseMove)
      mouseLeave()
      element.remove()
    },
  }
}
