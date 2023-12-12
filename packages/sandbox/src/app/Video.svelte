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
    if (muted.read || volume.read === 0) {
      volume.write = 0
      player.volumeLevel.write = 'muted'
    } else if (volume.read >= 0.5) {
      player.volumeLevel.write = 'high'
    } else {
      player.volumeLevel.write = 'low'
    }
  }}
  on:loadeddata={() => {
    player.time.mod({ total: ms2Hm(duration.read) })
  }}
  on:timeupdate={() => {
    player.time.mod({ current: ms2Hm(currentTime.read) })
    const percent = currentTime.read / duration.read

    player.progress.mod({ timeline: percent })
  }}
  use:down={{
    on: ['arrowleft', 'j'],
    action() {
      currentTime.write += -5
    },
  }}
  use:down={{
    on: ['arrowright', 'l'],
    action() {
      currentTime.write += 5
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
      player.miniPlayer.write = true
    },
    leavepictureinpicture() {
      player.miniPlayer.write = false
    },
  }}
  bind:this={player.refs.video}
>
  <track kind="captions" srclang="en" src="assets/subtitles.vtt" />
</video>
