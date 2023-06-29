import { createContext } from '$lib/create-context'
import { preSignal } from '$lib/pre-signal'
import { resizeAction } from '$lib/resize'
import { cleanSubscribers, diffStore } from '$lib/stores'
import { computed, effect } from '@preact/signals-core'
import { createContextMenuCallbacks } from 'src/context-menu/controller'
import { macro_chapters } from '$mock/chapter.json'
import { tick } from 'svelte'
import { createPreviewProgress } from '../controller/drag-vertically'
import { ms2Hms } from '../controller/formatter'
import { createRangeConfig } from './ratio/config'

const timeline = (config: { controlsMinHeight: number }) => {
  const seekTo = preSignal(0)
  const videoRect = diffStore(
    preSignal({
      width: 500,
      height: 350,
    })
  )
  let timelineHeight = preSignal(90)
  const tuneStoryboardRatio = 0.5
  let storyboardRatio = preSignal(0)
  const durationMs = Number(macro_chapters.pop()?.chapter.endTimeMs) || 0

  //#region Timeline
  const progress = preSignal({
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

  const sharedFocus = preSignal(false)

  return {
    context: {
      mount: () =>
        cleanSubscribers(
          effect(() => {
            progress.mod({ progress: seekTo.value / durationMs })
          }),
          progress.subscribe($progress =>
            diffBoundaries.forEach((diff, i) =>
              diff.tryInvalidate({
                boundary: boundaries[i].peek(),
                progress: $progress,
              })
            )
          )
        ),
      resizeRect: (el: HTMLElement) =>
        resizeAction(el, [
          rect => {
            videoRect.set({
              width: rect.width,
              height: rect.height,
            })
            timelineHeight.set(rect.height * tuneStoryboardRatio)
          },
        ]),
      controlsHeight: computed(
        () => config.controlsMinHeight * (1 - storyboardRatio.value / tuneStoryboardRatio)
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
        preview: computed(() => ms2Hms(durationMs * progress.value.preview)),
        progress: computed(() => ms2Hms(durationMs * progress.value.progress)),
      },
      chapters: {},
      events: rangeContext.events,
      trackVerticalResize: createPreviewProgress(storyboardRatio, timelineHeight),
      boundaryAction: callbacks.boundaryAction,
    },

    slider: {
      updateBoard(index: number) {
        tick().then(() => rangeContext.derivedRatios.diffBoundaries[index].progress.update($ => $))
      },

      sliderHeight: computed(() => timelineHeight.value * storyboardRatio.value),
    },
  }
}
export const { getTimelineContext, setTimelineContext } = createContext({
  timeline,
})
