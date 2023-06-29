<script lang="ts">
  import { timestamp_display_scroll_offset } from '$v3/components/drop-down-menu/App/miscellaneous/store'
  import { ms_options } from '$v3/components/drop-down-menu/App/stores/formatter'
  import { isSelected } from '$v3/lib/backend-frontend/option'
  import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
  import type { TQueryResult } from '$v3/player-ready/setup/GetQuery'
  import { onDestroy } from 'svelte'

  export let config: IExtendedVideoParams
  //export let store: ILocal
  export let control: TQueryResult | any
  //export let api: YT_TargetWrapper | any
  //export let elements: Pick<TQueryElements, 'iframe'> | any

  export let timeDisplay = <HTMLElement>{}
  const display = {
    start: { time: '00:00', tick: false },
    end: { time: '00:00', tick: false },
  }

  export let tick: n
  let interval: NodeJS.Timer
  let timeout: NodeJS.Timeout
  function clear() {
    clearInterval(interval)
    clearTimeout(timeout)
  }
  function update() {
    show()
    clearInterval(interval)
    interval = setInterval(() => {
      if (control.whole.anyHover()) {
        show()
      }
    }, tick)
  }
  function show() {
    const span = control.clipSpan()

    display.start.tick = control.tick() > config.end.value
    display.end.tick = span < 0

    // timeDisplay.textContent = '00:00/00:00'
    if (isSelected(ms_options, 'clip_lifespan_format')) {
      // 'bounded tick'/'clip end'
      const boundedTick = Math.abs(span - (config.end.value - control.tick()))
      const validEnd = display.end.tick ? config.end.value : span

      display.start.time = fmtMSS(boundedTick)
      display.end.time = fmtMSS(validEnd)
    } // 'update'/'end'
    else {
      display.start.time = fmtMSS(control.tick())
      display.end.time = fmtMSS(config.end.value)
    }
  }
  function seekToScroll(e: WheelEvent) {
    control.videoIsPlayingWithSound(false)

    let dir =
      control.tick() +
      Math.sign(e.deltaY) * Math.round(Number(timestamp_display_scroll_offset.value)) * -1

    if (isSelected(ms_options, 'clip_lifespan_format')) {
      if (dir <= config.start.value) {
        dir = config.end.value - 1 //can go beyond that
      }
      if (dir >= config.end.value) {
        dir = config.start.value //can go beyond that
      }
    }

    control.seekTo(dir)

    show()
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (control.whole.anyHover()) {
        control.videoIsPlayingWithSound()
      }
    }, tick) //nice delay to show feedback
  }

  function fmtMSS(seconds: n) {
    const format = (val: n) => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60
    const displayFormat = hours < 1 ? [minutes, seconds % 60] : [hours, minutes, seconds % 60]

    return displayFormat.map(format).join(':')
  }
  function TRY<F extends Function>(callback: F): F {
    // @ts-expect-error
    return function () {
      if (!control || !control.whole.anyHover()) {
        return
      }
      // @ts-expect-error
      callback.apply(this, arguments)
    }
  }

  const trySeekToScroll = TRY(seekToScroll)
  const tryUpdate = TRY(update)

  onDestroy(clear)
</script>

<div
  class="yt-gif-timestamp yt-gif-invisible-element"
  class:yt-gif-timestamp-update={false}
  bind:this={timeDisplay}
  on:wheel={trySeekToScroll}
  on:mouseenter={tryUpdate}
  on:mouseleave={clear}
>
  <div class="yt-gif-timestamp-start" data-start-tick={display.start.tick}>
    {display.start.time}
  </div>
  <div>/</div>
  <div class="yt-gif-timestamp-end" data-end-tick={display.end.tick}>
    {display.end.time}
  </div>
</div>

<slot interval={{ tryUpdate, clear }} />
