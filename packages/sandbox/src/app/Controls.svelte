<script lang="ts">
  import SVG from './SVG.svelte'
  import { keydown } from '$lib/event-life-cycle'
  import { getPlayerContext } from './timeline/context'

  const player = getPlayerContext()
  const { theater, fullScreen, volumeLevel, speedBtnTxt, time, paused, volume, centeredControls } =
    player
  export let dragThreshold = (e: any) => {}
</script>

<div class="controls" class:centeredControls={$centeredControls}>
  <button class="play-pause-btn" on:click={player.togglePlay}>
    <SVG icon={!$paused ? 'play' : 'pause'} />
  </button>

  <div class="volume-container">
    <button
      class="mute-btn"
      use:keydown={{
        on: 'm',
        click: function toggleMute() {
          player.muted.write = !player.muted.read
        },
      }}
    >
      <SVG icon={$volumeLevel} />
    </button>
    <input
      class="volume-slider"
      type="range"
      min="0"
      max="1"
      step="any"
      bind:value={$volume}
      on:input={e => {
        const value = e.currentTarget.value
        volume.write = Number(value)
        player.muted.write = value === '0'
      }}
    />
  </div>

  <div class="duration-container">
    <div class="current-time">{$time.current}</div>
    /
    <div class="total-time">{$time.total}</div>
  </div>

  {#if !$fullScreen && dragThreshold}
    <button class="drag-btn" on:mousedown={dragThreshold}>
      <SVG icon="drag" />
    </button>
  {/if}

  <button
    class="captions-btn"
    use:keydown={{
      on: 'c',
      click: function toggleCaptions() {
        const captionsTrack = player.refs.video.textTracks[0]
        const isHidden = captionsTrack.mode === 'hidden'
        captionsTrack.mode = isHidden ? 'showing' : 'hidden'
        player.captions.write = isHidden
      },
    }}
  >
    <SVG icon="captions" />
  </button>

  <button
    class="speed-btn wide-btn"
    on:click={function changePlaybackSpeed() {
      let newPlaybackRate = player.playbackRate.read + 0.25
      if (newPlaybackRate > 2) newPlaybackRate = 0.25
      player.playbackRate.write = newPlaybackRate
      speedBtnTxt.write = `${newPlaybackRate}x`
    }}
  >
    {$speedBtnTxt}
  </button>

  <button
    class="miniPlayer-btn"
    use:keydown={{
      on: 'i',
      click: function toggleMiniPlayerMode() {
        if (player.miniPlayer.read) {
          document.exitPictureInPicture().finally(() => (fullScreen.write = false))
        } else {
          player.refs.video
            .requestPictureInPicture()
            .then(() => (fullScreen.write = true))
            .catch(() => (fullScreen.write = false))
        }
      },
    }}
  >
    <SVG icon="mini" />
  </button>

  <button
    class="theater-btn"
    use:keydown={{
      on: 't',
      click: function toggleTheaterMode() {
        theater.write = !theater.read
      },
    }}
  >
    <SVG icon={$theater ? 'tall' : 'wide'} />
  </button>

  <button
    class="fullScreen-btn"
    use:keydown={{
      on: 'f',
      click: player.fullScreen.toggle,
    }}
  >
    <SVG icon={$fullScreen ? 'open' : 'close'} />
  </button>
</div>

<style lang="scss">
  .controls {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    align-items: center;
    justify-content: center;

    button {
      background: none;
      border: none;
      color: inherit;
      padding: 0;
      height: 30px;
      width: 30px;
      font-size: 1.1rem;
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 150ms ease-in-out;
      &:hover {
        opacity: 1;
      }
      &.wide-btn {
        width: auto;
      }
    }

    .volume-container {
      display: flex;
      align-items: center;

      .volume-slider {
        width: 0px;
        transform-origin: left;
        --tns: translate(0px, 0px);
        transform: scaleX(0) var(--tns);
        transition:
          width 150ms ease-in-out,
          transform 150ms ease-in-out;
        appearance: auto;
      }
      &:hover .volume-slider,
      .volume-slider:focus-within {
        width: 100px;
        transform: scaleX(1) var(--tns);
      }
    }
    .duration-container {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-grow: 1;
    }
    &.centeredControls {
      .volume-slider {
        width: 100px;
        position: absolute;
        --tns: translate(-40%, -200%) !important;

        // ux padding
        &::before {
          content: '';
          //background: #ff00004a;
          width: 100%;
          height: 210%;
          position: absolute;
          display: block;
        }
      }
      .duration-container {
        flex-grow: 0;
      }
    }
  }
</style>
