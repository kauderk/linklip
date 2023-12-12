import type { SvelteSignal } from '$lib/solid'
import { createMouseTrack } from './mouse-track'

export function createPreviewProgress(
  storyboardRatio: SvelteSignal<n>,
  timelineHeight: SvelteSignal<n>
) {
  let mouseY = 0
  let downRatio = 0
  return createMouseTrack({
    mousedown(e: MouseEvent) {
      const currentPreview = storyboardRatio.read * timelineHeight.read
      mouseY = e.clientY + currentPreview
      downRatio = storyboardRatio.read
    },
    mousemove(e: MouseEvent) {
      e.preventDefault()
      const delta = mouseY - e.clientY
      const at = Math.min(Math.max(0, delta), timelineHeight.read)
      const newRatio = at / timelineHeight.read
      if (downRatio < 0.5) {
        if (newRatio < 0.25) {
          storyboardRatio.write = 0
          return
        }
      } else {
        if (newRatio > 0.8) {
          storyboardRatio.write = 1
          return
        }
      }

      storyboardRatio.write = newRatio
    },
    mouseup() {
      storyboardRatio.write = Math.round(storyboardRatio.read)
    },
  })
}
