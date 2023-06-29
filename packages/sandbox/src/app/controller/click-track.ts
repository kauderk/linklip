import { createMouseTrack } from './mouse-track'

const Props = {
  moveThreshold: 5,
  threshold(e: MouseEvent) {},
  holdDelay: 500,
  hold(e: MouseEvent) {},
}
export function createTrackMouseHold(props: Partial<typeof Props>) {
  // move
  let move = false
  let startX: number, startY: number
  const moveThreshold = props.moveThreshold ?? Props.moveThreshold

  // hold
  let timer: number
  let up = false
  const holdDelay = props.holdDelay ?? Props.holdDelay

  return createMouseTrack({
    mousedown(event) {
      // move
      startX = event.clientX
      startY = event.clientY

      // hold
      up = false
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (move || up) return
        props.hold?.(event)
      }, holdDelay)
    },
    mousemove(event) {
      // move
      if (move || up) return
      const distanceX = Math.abs(event.clientX - startX)
      const distanceY = Math.abs(event.clientY - startY)
      if (distanceX > moveThreshold || distanceY > moveThreshold) {
        move = true
        props.threshold?.(event)
      }
    },
    mouseup() {
      // move
      move = false

      // hold
      up = true
      clearTimeout(timer)
    },
  })
}
