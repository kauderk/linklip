import { createContext } from '$lib/create-context'
import { cleanSubscribers } from '$lib/stores'
import storyboard_ from '$mock/storyboard.json'
import { createSvelteSignal, onCleanup } from '$lib/solid'
import { createFullScreenController } from '../controller/fullscreen'

export const storyboard = () => ({
  totalSize: createSvelteSignal(storyboard_.high.slot.thumbnailCount),
})
export const { getStoryboardContext, setStoryboardContext } = createContext({
  storyboard,
})

export const player = () => {
  let refs = {
    videoContainer: <HTMLElement>{},
    video: <HTMLVideoElement>{},
  }
  const paused = createSvelteSignal(true)
  const fullScreen = createFullScreenController(refs)

  onCleanup(() => {
    // FIXME: make the types a undefined union
    // @ts-expect-error
    refs = {}
  })
  return {
    scrubbing: createSvelteSignal(false),
    captions: createSvelteSignal(false),
    miniPlayer: createSvelteSignal(false),
    theater: createSvelteSignal(false),
    fullScreen: fullScreen,
    centeredControls: createSvelteSignal(false),

    volumeLevel: createSvelteSignal<'high' | 'low' | 'muted'>('high'),
    speedBtnTxt: createSvelteSignal('1x'),
    time: createSvelteSignal({ current: '0:00', total: '0' }),

    volume: createSvelteSignal(1),
    paused,
    muted: createSvelteSignal(false),
    duration: createSvelteSignal(0),
    playbackRate: createSvelteSignal(1),
    currentTime: createSvelteSignal(0),
    progress: createSvelteSignal({
      preview: 0,
      timeline: 0.2,
    }),
    refs,

    togglePlay() {
      paused.read ? refs.video.play() : refs.video.pause()
    },
  }
}
export const { getPlayerContext, setPlayerContext } = createContext({
  player,
})
