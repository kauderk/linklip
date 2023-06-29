import type { PreSignal } from '../../lib/pre-signal'
import { createMouseTrack } from './mouse-track'

export function createPreviewProgress(storyboardRatio: PreSignal<n>, timelineHeight: PreSignal<n>) {
  let mouseY = 0
  let downRatio = 0
  return createMouseTrack({
    mousedown(e: MouseEvent) {
      const currentPreview = storyboardRatio.peek() * timelineHeight.peek()
      mouseY = e.clientY + currentPreview
      downRatio = storyboardRatio.peek()
    },
    mousemove(e: MouseEvent) {
      e.preventDefault()
      const delta = mouseY - e.clientY
      const at = Math.min(Math.max(0, delta), timelineHeight.peek())
      const newRatio = at / timelineHeight.peek()
      if (downRatio < 0.5) {
        if (newRatio < 0.25) {
          storyboardRatio.value = 0
          return
        }
      } else {
        if (newRatio > 0.8) {
          storyboardRatio.value = 1
          return
        }
      }

      storyboardRatio.value = newRatio
    },
    mouseup() {
      storyboardRatio.value = Math.round(storyboardRatio.peek())
    },
  })
}
