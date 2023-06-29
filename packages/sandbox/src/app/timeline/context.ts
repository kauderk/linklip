import { createContext } from '$lib/create-context'
import { cleanSubscribers } from '$lib/stores'
import storyboard_ from '$mock/storyboard.json'
import { preSignal } from '$lib/pre-signal'
import { createFullScreenController } from '../controller/fullscreen'

export const storyboard = () => ({
  totalSize: preSignal(storyboard_.high.slot.thumbnailCount),
})
export const { getStoryboardContext, setStoryboardContext } = createContext({
  storyboard,
})

export const player = () => {
  let refs = {
    videoContainer: <HTMLElement>{},
    video: <HTMLVideoElement>{},
  }
  const paused = preSignal(true)
  const fullScreen = createFullScreenController(refs)

  return {
    scrubbing: preSignal(false),
    captions: preSignal(false),
    miniPlayer: preSignal(false),
    theater: preSignal(false),
    fullScreen: fullScreen.fullScreen,
    centeredControls: preSignal(false),

    volumeLevel: preSignal<'high' | 'low' | 'muted'>('high'),
    speedBtnTxt: preSignal('1x'),
    time: preSignal({ current: '0:00', total: '0' }),

    volume: preSignal(1),
    paused,
    muted: preSignal(false),
    duration: preSignal(0),
    playbackRate: preSignal(1),
    currentTime: preSignal(0),
    progress: preSignal({
      preview: 0,
      timeline: 0.2,
    }),
    refs,

    mount: () =>
      cleanSubscribers(fullScreen.mount(), () => {
        // @ts-ignore
        refs = {}
      }),
    togglePlay() {
      paused.value ? refs.video.play() : refs.video.pause()
    },
  }
}
export const { getPlayerContext, setPlayerContext } = createContext({
  player,
})
