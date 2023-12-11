import type { SvelteSignal } from '../../lib/pre-signal'
import { createListeners } from '../../lib/event-life-cycle'
import { createMouseTrack } from '../controller/mouse-track'

export type Progress = {
  preview: number
  scrubbing: boolean
  progress: number
}
export function createScrubber(progress: SvelteSignal<Progress>) {
  let timelineRef: HTMLElement

  function mousedown(e: MouseEvent) {
    progress.mod({ scrubbing: (e.buttons & 1) === 1 })
    mousemove(e)
  }
  function mousemove(e: MouseEvent) {
    const percentage = getPercentage(e)
    progress.mod({ preview: percentage })

    if (progress.peek().scrubbing) {
      e.preventDefault()
      progress.mod({ progress: percentage })
    }
  }
  function getPercentage(e: MouseEvent) {
    if (!timelineRef) {
      console.warn('timelineRef is not set')
      return 0
    }
    const rect = timelineRef.getBoundingClientRect()
    return Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  }

  return {
    progress,
    mousemove,
    useTimelineRef: (node: HTMLElement) => {
      timelineRef = node
    },
    trackMouse: createMouseTrack({
      mousedown,
      mouseup(e: MouseEvent) {
        if (progress.peek().scrubbing) progress.mod({ scrubbing: false })
      },
      mousemove(e: MouseEvent) {
        if (progress.peek().scrubbing) mousemove(e)
      },
    }),
  }
}
