<svelte:options accessors />

<script lang="ts">
  import { createSvelteSignal, createSvelteMemo } from '$lib/solid'
  import { useClass } from '$lib/solid/useDirective'
  import { cleanSubscribers } from '$lib/stores'
  import { onMount } from 'svelte'
  import Controls from './Controls.svelte'
  import { resize } from './Resize.svelte'
  import SVG from './SVG.svelte'
  import Timeline from './Timeline.svelte'
  import Video from './Video.svelte'
  import { type getFollowerContext, zIndex } from './controller/follower'
  import { createHoverTrack } from './controller/hover-tracker'
  import { getPlayerContext } from './timeline/context'
  import { setTimelineContext } from './timeline/controller'
  import { createConfig } from './integrations/followerCycles'

  export let config = createConfig()
  export let player = getPlayerContext()
  export let timeline = setTimelineContext({ controlsMinHeight: 38 })
  export let follower: ReturnType<typeof getFollowerContext>
  export let mount = () => () => {}
  export let dragThreshold = (e: MouseEvent) => {}

  onMount(() =>
    cleanSubscribers(
      mount(),
      timeline.context.mount(),
      player.mount(),
      config.resizing.subscribe(resizing => {
        if (!resizing && config.stage.peek().mode != 'free') {
          follower.styleHost()
        }
      })
    )
  )

  const { paused, fullScreen, time } = player
  const { resizeRect } = timeline.context
  const { rect } = config
  const { registerFollower } = follower

  const tiny = createSvelteMemo(() => rect.value.width <= 80)
  // it seems the preact/signal is falling behind some frames... +5 should be enough
  const normal = createSvelteMemo(() => rect.value.width + 5 > config.minWidth || fullScreen.value)
  let any = '' as any

  const scrubbing = createSvelteSignal(false)
  // Because the follower hides the overflow
  // make the .progress-bar .scrubber-container visible
  const nudgeHeight = (nudge = 0) => (scrubbing.value = nudge != 0)
  const timelineTracker = createHoverTrack({
    mouseenter: () => nudgeHeight(5),
    mouseleave: () => nudgeHeight(),
  })
  const { progress } = timeline.progressBar
</script>

<div
  class="follower"
  use:useClass={{ resizing: config.resizing, fullScreen }}
  hidden
  use:registerFollower
  on:mouseenter={e => {
    zIndex.value++
    e.currentTarget.style.zIndex = zIndex.peek().toString()
  }}
  style:--video-width="{$rect.width}px"
  style:--video-aspect-ratio={config.aspectRatio.toString()}
>
  <!-- prettier-ignore -->
  <div
		class="followerContent"
	>
	<div
		class:mini={!$normal}
		class="video-container video-cover context-menu-boundary {any}"
		class:tiny={$tiny}
		use:resize={config}
		use:useClass={{
			paused,
			scrubbing: player.scrubbing,
			captions: player.captions,
			miniPlayer: player.miniPlayer,
			theater: player.theater,
			fullScreen,
		}}
		bind:this={player.refs.videoContainer}
		use:resizeRect
	>
		<Video on:mousedown={dragThreshold} />

		{#if normal}
			<div class="video-controls-container bottom">
				<!-- <Timeline /> -->
				<Controls dragThreshold={dragThreshold} />
			</div>
		{:else}
			<div class="miniPlayer" class:inactive={$progress.scrubbing || $scrubbing || !$paused} class:tiny={$tiny}>
				<div class="controls">
					<button class="maximize"><SVG icon="maximize" /></button>
					<button class="playPause max"><SVG icon="pause" /></button>
					<button class="close"><SVG icon="x" /></button>
				</div>

				<div class="duration-container">
					<div class="current-time">{$time.current}</div>
					/
					<div class="total-time">{$time.total}</div>
				</div>
			</div>
			{#if !$tiny}
				<div
					class="video-controls-container bottom elevated"
					
					on:mouseenter={timelineTracker}
				>
					<Timeline />
				</div>
			{/if}
		{/if}
	</div>
</div>
</div>

<style lang="scss">
  .video-cover {
    width: var(--video-width, 350px);
    aspect-ratio: var(--video-aspect-ratio, 16/9);
  }
  * {
    user-select: none;
  }
  .follower {
    z-index: var(--ytg-z-index, 101);
    // background: rgba(0, 0, 0, 0.362);
    position: fixed;
    overflow: hidden;
    &.fullScreen :global(.grabber) {
      display: none;
    }
    &.resizing {
      background-color: transparent;
    }
    .followerContent {
      width: inherit;
      height: inherit;
      top: var(--topOffset);
      left: var(--leftOffset);
      position: absolute;
    }
    &:global(.pointer) {
      opacity: 0.5 !important;
      pointer-events: none !important;
      outline: 10px solid red;
    }
  }

  // -------------------
  .video-container {
    position: relative;
    display: flex;
    justify-content: center;
    background-color: black;

    &.normal {
      margin-inline: auto;
    }
    &.mini :global(.grabber.bottom) {
      display: none;
    }
    &.tiny :global(.grabber) {
      display: none;
    }

    &.theater {
      max-height: 90vh;
    }
    &.fullScreen {
      max-height: 100vh;
    }
    &.captions :global(.captions-btn) {
      border-bottom: 3px solid red;
    }
    &.theater,
    &.fullScreen {
      max-width: initial;
      width: 100%;
    }

    :global(video) {
      width: 100%;
    }
    &:hover {
      --opacity: 1;
    }
  }

  // -------------------
  .video-controls-container {
    &.bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
    opacity: var(--opacity, 0);
    color: white;
    z-index: 1;
    margin-inline: 0.5em;
    transition: opacity 150ms ease-in-out;

    &::before {
      content: '';
      position: absolute;
      bottom: 1px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
      width: 100%;
      aspect-ratio: var(--video-aspect-ratio, 16/9);
      z-index: -1;
      pointer-events: none;
    }
  }
  // &:hover,
  // &:focus-within,
  // &.paused {
  // 	.video-controls-container {
  // 		opacity: 1;
  // 	}
  // }

  // -------------------
  .miniPlayer {
    opacity: var(--opacity, 0);
    transition: all 0.15s ease-in-out;

    &.inactive {
      opacity: 0 !important;
    }

    --p: 0.5em;
    --btn-h: 30px;
    button {
      color: white;
      width: var(--btn-h);
      aspect-ratio: 1;
      cursor: pointer;
    }
    &:not(.tiny) > .controls {
      button {
        position: absolute;
      }
      .maximize {
        top: var(--p);
        left: var(--p);
      }
      .close {
        top: var(--p);
        right: var(--p);
      }
      .playPause {
        --center: calc(50% - var(--btn-h) / 2);
        top: var(--center);
        left: var(--center);
      }
    }
    &.tiny {
      > .controls {
        position: absolute;
        width: var(--video-width, 350px);
        display: flex;
        justify-content: space-around;
        left: 0;
      }
      .duration-container {
        width: var(--video-width, 350px);
        bottom: 0;
        left: 0;
        gap: 0;
      }
    }
    .duration-container {
      color: white;
      display: flex;
      position: absolute;
      gap: 0.25rem;
      left: var(--p);
      bottom: 10px;
      z-index: 2;
      pointer-events: none;
    }
  }
</style>
