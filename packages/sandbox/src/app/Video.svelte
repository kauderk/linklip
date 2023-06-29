<script lang="ts">
  import { ms2Hm } from './controller/formatter'
  import { getPlayerContext } from './timeline/context'
  import { down, Event } from '../lib/event-life-cycle'

  const player = getPlayerContext()
  const { volume, muted, duration, playbackRate, currentTime } = player
  const { paused } = player
</script>

<video
  bind:paused={$paused}
  bind:volume={$volume}
  bind:muted={$muted}
  bind:duration={$duration}
  bind:playbackRate={$playbackRate}
  bind:currentTime={$currentTime}
  on:click={player.togglePlay}
  on:dblclick={player.fullScreen.toggle}
  on:mousedown
  on:volumechange={() => {
    if (muted.value || volume.value === 0) {
      volume.value = 0
      player.volumeLevel.value = 'muted'
    } else if (volume.value >= 0.5) {
      player.volumeLevel.value = 'high'
    } else {
      player.volumeLevel.value = 'low'
    }
  }}
  on:loadeddata={() => {
    player.time.mod({ total: ms2Hm(duration.value) })
  }}
  on:timeupdate={() => {
    player.time.mod({ current: ms2Hm(currentTime.value) })
    const percent = currentTime.value / duration.value

    player.progress.mod({ timeline: percent })
  }}
  use:down={{
    on: ['arrowleft', 'j'],
    action() {
      currentTime.value += -5
    },
  }}
  use:down={{
    on: ['arrowright', 'l'],
    action() {
      currentTime.value += 5
    },
  }}
  use:down={{
    on: [' ', 'k'],
    action(_, e) {
      // prettier-ignore
      if (e.key.toLowerCase() == ' ' && document.activeElement?.tagName.toLowerCase() === 'button'){
				return
			}
      player.togglePlay()
    },
  }}
  use:Event={{
    enterpictureinpicture() {
      player.miniPlayer.value = true
    },
    leavepictureinpicture() {
      player.miniPlayer.value = false
    },
  }}
  bind:this={player.refs.video}
>
  <track kind="captions" srclang="en" src="assets/subtitles.vtt" />
</video>
