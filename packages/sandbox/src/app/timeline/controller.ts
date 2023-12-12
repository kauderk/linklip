import { createContext } from '$lib/create-context'
import { createSvelteSignal, createSvelteMemo, effect, createComputed } from '$lib/solid'
import { resizeAction } from '$lib/resize'
import { cleanSubscribers, diffStore } from '$lib/stores'
import { createContextMenuCallbacks } from 'src/context-menu/controller'
import { macro_chapters } from '$mock/chapter.json'
import { tick } from 'svelte'
import { createPreviewProgress } from '../controller/drag-vertically'
import { ms2Hms } from '../controller/formatter'
import { createRangeConfig } from './ratio/config'

const timeline = (config: { controlsMinHeight: number }) => {
  const seekTo = createSvelteSignal(0)
  const videoRect = diffStore(
    createSvelteSignal({
      width: 500,
      height: 350,
    })
  )
  let timelineHeight = createSvelteSignal(90)
  const tuneStoryboardRatio = 0.5
  let storyboardRatio = createSvelteSignal(0)
  const durationMs = Number(macro_chapters.pop()?.chapter.endTimeMs) || 0

  //#region Timeline
  const progress = createSvelteSignal({
    preview: 0,
    scrubbing: false,
    progress: 0.2,
  })

  //#endregion

  //#region Slider
  const rangeContext = createRangeConfig()
  const { diffBoundaries, boundaries } = rangeContext.derivedRatios

  //#endregion

  const callbacks = createContextMenuCallbacks({
    boundaries,
    states: rangeContext.states,
    add: rangeContext.add,
    remove: rangeContext.remove,
    ratioY: storyboardRatio,
    progress,
  })

  const sharedFocus = createSvelteSignal(false)

  createComputed(() => {
    progress.mod({ progress: seekTo.signal / durationMs })
    diffBoundaries.forEach((diff, i) =>
      diff.tryInvalidate({
        boundary: boundaries[i].read,
        progress: progress.read,
      })
    )
  })
  return {
    context: {
      resizeRect: (el: HTMLElement) =>
        resizeAction(el, [
          rect => {
            videoRect.write = {
              width: rect.width,
              height: rect.height,
            }
            timelineHeight.write = rect.height * tuneStoryboardRatio
          },
        ]),
      controlsHeight: createSvelteMemo(
        () => config.controlsMinHeight * (1 - storyboardRatio.signal / tuneStoryboardRatio)
      ),
    },

    shared: {
      rangeContext,
      staleValues: rangeContext.staleValues,
      ratios: rangeContext.derivedRatios,
      actions: {
        stateAction: callbacks.stateAction,
        processContextMenu: callbacks.processContextMenu,
      },
      sharedFocus,
    },

    progressBar: {
      progress,
      time: {
        preview: createSvelteMemo(() => ms2Hms(durationMs * progress.signal.preview)),
        progress: createSvelteMemo(() => ms2Hms(durationMs * progress.signal.progress)),
      },
      chapters: {},
      events: rangeContext.events,
      trackVerticalResize: createPreviewProgress(storyboardRatio, timelineHeight),
      boundaryAction: callbacks.boundaryAction,
    },

    slider: {
      updateBoard(index: number) {
        tick().then(() => rangeContext.derivedRatios.diffBoundaries[index].progress.mod({}))
      },

      sliderHeight: createSvelteMemo(() => timelineHeight.signal * storyboardRatio.signal),
    },
  }
}
export const { getTimelineContext, setTimelineContext } = createContext({
  timeline,
})
