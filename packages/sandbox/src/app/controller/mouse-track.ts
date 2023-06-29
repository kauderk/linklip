type EventHandler<K extends string, T, E = MouseEvent> = {
  [key in K]?: (
    e: E & {
      currentTarget: EventTarget & T
    },
    originalTarget: HTMLElement
  ) => any
}
/**
 * Release the mousemove event when the mouse is up
 */
export function createMouseTrack(
  fns: EventHandler<'mousedown', HTMLElement> &
    EventHandler<'mouseup' | 'mousemove', Window> &
    EventHandler<'keydown' /*| 'keyup' */, Window>
) {
  return function trackMouse(e: MouseEvent) {
    if (e.which !== 1) return

    const freezeTarget = e.currentTarget as HTMLElement
    fns.mousedown?.(e as any, freezeTarget)

    const mousemove = (e: any) => fns.mousemove?.(e, freezeTarget)
    const keydown = (e: any) => fns.keydown?.(e, freezeTarget)

    window.addEventListener('mousemove', mousemove)
    window.addEventListener('keydown', keydown)
    window.addEventListener(
      'mouseup',
      (e: any) => {
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('keydown', keydown)
        fns.mouseup?.(e, freezeTarget)
      },
      { once: true }
    )
  }
}
