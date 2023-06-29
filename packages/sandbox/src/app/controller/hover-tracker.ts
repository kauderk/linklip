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
export function createHoverTrack(fns: EventHandler<'mouseenter' | 'mouseleave', HTMLElement>) {
  return function track(e: MouseEvent) {
    const freezeTarget = e.currentTarget as HTMLElement
    fns.mouseenter?.(e as any, freezeTarget)
    freezeTarget.addEventListener(
      'mouseleave',
      (e: any) => {
        fns.mouseleave?.(e, freezeTarget)
      },
      { once: true }
    )
  }
}
