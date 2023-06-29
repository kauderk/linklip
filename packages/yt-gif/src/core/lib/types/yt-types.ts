import { isRendered, keyFinder, sleep } from '$lib/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
const NotImplementationWarning = <R extends unknown>(): R => {
  console.warn('Not implemented')
  return <R>{}
}
export class T_YT_RECORD {
  wTarget: YT_TargetWrapper | undefined
  constructor(wTarget?: YT_TargetWrapper) {
    this.wTarget = wTarget
  }
  // uid: string = ''
  // seekToUpdatedTime: (desiredTime: number) => void = NotImplementationWarning
  sameBoundaries: () => boolean = NotImplementationWarning
  isSoundingFine: (bol: boolean) => void = NotImplementationWarning
  togglePlay: (bol: boolean) => void = NotImplementationWarning
  // bounded: (sec: number) => boolean = NotImplementationWarning
}
interface YT_IFRAME {
  readonly target: unknown
  readonly wTarget: YT_TargetWrapper
  readonly data: number
}
export const PlayerState = Object.freeze({
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
})
export class YT_TargetWrapper {
  t: any
  ytgif: m

  constructor(target: any) {
    this.t = target
    target.ytgif ??= new m()
    this.ytgif = target.ytgif
  }
  events: {
    // onReady(): Promise<void>
    // onStateChange(): Promise<void>
    /**
     * give a change to `TryReloadVideo()` to perform it's process
     */
    reloading?: boolean
  } = {}
  GetIframeID: FString = () => this.t.i?.id || this.t.g?.id || this.t.getIframe()?.id
  GetVideoID: FString = () =>
    this.t.i?.h?.videoId ||
    this.t.playerInfo?.videoData?.video_id ||
    JSON.parse(this.t.playerInfo?.debugText || '{}')?.debug_videoId ||
    keyFinder(this.t, 'videoId')
  GetPlayerVars: () => {
    start: number
    end: number
  } = () => this.t.j?.i?.playerVars || this.t.i?.h?.playerVars || keyFinder(this.t, 'playerVars')
  // any should do, because sometimes it holds
  ApiIsWorking: () => Function | undefined = () => this.t.seekTo
  async WhileApiBuffering(params: {
    delay?: n
    tries?: n
    iframe?: HTMLElement
    condition?: () => b
  }) {
    params.delay ??= 500
    params.tries ??= 20
    params.condition ??= () => true
    const iframe = params.iframe ?? this.getIframe()
    while (
      params.tries > 0 &&
      isRendered(iframe) &&
      // null getCurrentTime? then the api object is stale
      params.condition?.() &&
      !isNaN(this.t?.getCurrentTime?.())
    ) {
      params.tries -= 1
      await sleep(params.delay)
    }
  }
  async WhileApiHolds(params: { delay?: n; iframe?: HTMLElement }) {
    params.delay ??= 500
    const iframe = params.iframe ?? this.getIframe()
    while (
      isRendered(iframe) &&
      // null getCurrentTime? then the api object is stale
      !this.t?.getCurrentTime?.()
    ) {
      await sleep(params.delay)
    }
  }
  DestroyTarget() {
    if (!this.t) return
    this.ytgif.enter = () => {
      /* empty */
    }
    this.t.destroy()
  }

  loadVideoById: (detail: {}) => Promise<void> = o => this.t.loadVideoById(o)

  getDuration: FNumber = () => this.t.getDuration()

  setVolume: (vol: number) => void = (n: n) => this.t.setVolume(n)
  getVolume: FNumber = () => this.t.getVolume()

  seekTo: (sec: number) => void = (n: n) => this.t.seekTo(n)
  getCurrentTime: FNumber = () => this.t.getCurrentTime()

  getPlayerState: FNumber = () => this.t.getPlayerState()
  setPlaybackRate: (rate: number) => void = (n: n) => this.t.setPlaybackRate(n)
  getPlaybackRate: FNumber = () => this.t.getPlaybackRate()
  playVideo: FVoid = () => this.t.playVideo()
  pauseVideo: FVoid = () => this.t.pauseVideo()
  unMute: FVoid = () => this.t.unMute()
  mute: FVoid = () => this.t.mute()

  getIframe: () => HTMLIFrameElement = () =>
    this.t.getIframe() || document?.getElementById?.(this.GetIframeID())
  destroy: FVoid = () => this.t.destroy()
  getAvailablePlaybackRates: () => number[] = () => this.t.getAvailablePlaybackRates() ?? []
}
type TSetStageChange = (state: YT_IFRAME) => Promise<void>
class m {
  previousTick = 0
  timers = Array<number>()
  timerID = 0
  globalHumanInteraction = false
  ClearTimers() {
    window.clearInterval(this.timerID)
    this.timerID = 0

    if (this.timers.length != 0) {
      for (const tmr of this.timers) {
        clearInterval(tmr)
      }

      this.timers = []
    }
  }
  PushSingleInterval(cb: () => void, delay = 1000) {
    this.ClearTimers()
    this.timerID = window.setInterval(cb, delay)
    this.timers.push(this.timerID)
  }
  enter() {
    /*NewIntervalUpdate*/
  }
}
