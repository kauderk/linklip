<script lang="ts" context="module">
  const _Config = {
    width: 350,
    minWidth: 300,
    aspectRatio: [16, 9] as [number, number],
  }
  function createConfig(config?: Partial<typeof _Config>) {
    const _config = { ..._Config, ...config }
    const width = _config.width
    const aspectRatio = aspectRatioFrom([..._config.aspectRatio])
    const height = width / aspectRatio.value
    const windowed = typeof window !== 'undefined'
    const offset = 200
    return {
      ..._config,
      aspectRatio,
      // prettier-ignore
      rect: preSignal({
				x: (windowed ? window.innerWidth  / 2 : offset) - width / 2,
				y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
				width,
				height,
			}),
      resizing: preSignal(false),
      stage: createDefaultStage(),
      resizeMode: 'inlineBlock' as ResizeConfig['resizeMode'],
    }
  }
  function styleHost(hostRef?: HTMLElement, rect?: any) {
    if (!hostRef) return
    const on = !!rect
    const maxWidth = hostRef?.closest(`.notranslate`)?.clientWidth || _Config.width
    const _rect = rect || ({} as any) // if falsy, it will be removed
    toggleStyle('width', `${_rect.width}px`, on, hostRef)
    toggleStyle('max-width', `${maxWidth}px`, on, hostRef)
    toggleStyle('height', `${_rect.height}px`, on, hostRef)
    toggleStyle('max-height', `${maxWidth / (16 / 9)}px`, on, hostRef)
    toggleStyle('display', '-webkit-inline-box', on, hostRef)
    toggleStyle('background', 'black', on, hostRef)
    toggleStyle('opacity', '1', on, hostRef)
  }
</script>

<script lang="ts">
  import { preSignal } from '$lib/pre-signal'
  import { useClass } from '$lib/solid/useDirective'
  import { cleanSubscribers } from '$lib/stores'
  import { computed } from '@preact/signals-core'
  import { onMount } from 'svelte'
  import Controls from './Controls.svelte'
  import { aspectRatioFrom, resize, type ResizeConfig } from './Resize.svelte'
  import SVG from './SVG.svelte'
  import Timeline from './Timeline.svelte'
  import Video from './Video.svelte'
  import {
    setFollowerContext,
    toggleStyle,
    type FollowerConfig,
    type FollowerCycle,
  } from './controller/follower'
  import { createHoverTrack } from './controller/hover-tracker'
  import { cornerFollowerCycle, observerSelectors } from './follower/corner'
  import { getPlayerContext } from './timeline/context'
  import { setTimelineContext } from './timeline/controller'
  import { createDefaultStage, getStagesContext } from './follower/store'
  import { selectorsFuncs } from './follower/selectors'

  const followerCycle = {
    update(hostRef, initRect) {
      return {
        value() {
          // https://stackoverflow.com/q/39417566
          const rect = hostRef.getBoundingClientRect()
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }
        },
      }
    },
    clean(followerRef) {
      followerRef?.style.removeProperty('--topOffset')
      followerRef?.style.removeProperty('--leftOffset')
    },
    resize(followerRef, entry, initRect, isFull) {
      if (isFull) {
        this.clean!(followerRef)
        return
      }
      const topOffset = entry.boundingClientRect.top - entry.intersectionRect.top
      const leftOffset = entry.boundingClientRect.left - entry.intersectionRect.left
      followerRef?.style.setProperty('--topOffset', topOffset + 'px')
      followerRef?.style.setProperty('--leftOffset', leftOffset + 'px')

      return {
        value: {
          x: entry.intersectionRect.x,
          y: entry.intersectionRect.y,
          width: entry.intersectionRect.width,
          height: entry.intersectionRect.height,
        },
      }
    },
  } satisfies FollowerCycle

  export let player = getPlayerContext()
  const stages = getStagesContext()

  let cornerOffset = {
    y: 70,
    x: 20,
  }
  const originalCornerOffset = { ...cornerOffset }
  const config = {
    ...createConfig(),
    selectors: {
      notionLink: {
        selector: {
          target: `[href*="youtu"]>span`,
          pointer: true,
        },
        observerSelectors,
        styleHost,
        followerCycle,
        postBranch() {
          config.resizeMode = 'inlineBlock'
        },
      },
      theater: {
        selector: {
          target: `.theater_content`,
        },
        followerCycle: {
          update: followerCycle.update,
        },
        styleHost,
        preBranch(payload) {
          const gallery = document.querySelector('.theater_content')
          // @ts-expect-error
          return gallery?.branch(null, payload.selected) // Promise
        },
      },
      sharedControls: {
        selector: {
          target: '.shared-controls *',
          outline: '.shared-controls',
          pointer: true,
        },
        observerSelectors,
        stageSignal: stages.sharedControls,
        followerCycle,
      },
      notionPage: {
        selector: {
          target: '.notion-page-content',
        },
        observerSelectors,
        followerCycle: cornerFollowerCycle({
          update: r => ({
            ...r,
            x: r.x - cornerOffset.x,
            y: r.y - cornerOffset.y,
          }),
          resize: (r, i, e) => ({
            ...r,
            width: i.width,
            x: e.right - i.width - cornerOffset.x,
            y: r.y - cornerOffset.y,
          }),
        }),
      },
      notionTopBar: {
        selector: {
          target: '.notion-topbar > div',
        },
        followerCycle: {
          update(hostRef) {
            return {
              value() {
                // prettier-ignore
                const startFrom = hostRef.querySelector('div.notranslate.shadow-cursor-breadcrumb')!.getBoundingClientRect()
                const hostRect = hostRef.getBoundingClientRect()
                // if the hostRect is at x:0, y: 0, width: 100, height: 30
                // return at x: 20%, y: 0, width: 60%, height: 30
                const xPadding = 15
                const height = hostRect.height
                const width = height * (16 / 9)
                return {
                  x: startFrom.right + xPadding,
                  y: hostRect.top,
                  width,
                  height,
                }
              },
            }
          },
          // TODO: should provide the rect
          clean(followerRef) {
            if (!followerRef) return
            const width = _Config.minWidth + 1
            config.rect.set({
              ...config.rect.peek(),
              width,
              height: width / config.aspectRatio.value,
            })
          },
        },
      },
      notionMainScroller: {
        selector: {
          target: '.notion-scroller main',
        },
        followerCycle: {
          update(hostRef, _, signal) {
            return {
              value() {
                const crr = signal.peek()
                const v = selectorsFuncs.notionMainScroller.update(hostRef)
                return {
                  ...crr,
                  x: v.x + v.width - crr.width - cornerOffset.x,
                  y: window.innerHeight - crr.height - cornerOffset.y,
                }
              },
            }
          },
        },
        postBranch() {
          config.resizeMode = 'inlineBlockReversed'
        },
      },
      leftGallery: {
        selector: {
          target: '.left .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .left .items',
          resize: '.gallery .left .items',
        },
      },
      rightGallery: {
        selector: {
          target: '.right .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .right .items',
          resize: '.gallery .right .items',
        },
      },
      topGallery: {
        selector: {
          target: '.top .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .top .items',
          resize: '.gallery .top .items',
          window: false,
        },
      },
    },
    pictureInPicture: true,
  } satisfies FollowerConfig
  function preBranch(payload: { selected: boolean }) {
    // @ts-expect-error
    const direction = this.selector.target.split(' ')[0].slice(1)
    const gallery = document.querySelector('.gallery-' + direction)
    // @ts-expect-error
    return gallery?.branch('[href*="youtu"]>span', payload.selected) // Promise
  }

  const { paused, fullScreen, time } = player
  export let timeline = setTimelineContext({ controlsMinHeight: 38 })
  const { resizeRect } = timeline.context
  export let follower = setFollowerContext(config)
  const { rect } = config
  const { registerFollower } = follower

  export let host: Element | undefined | string = undefined
  const bottom = ['notionPage', 'notionMainScroller']
  const top = ['notionTopBar']
  onMount(() =>
    cleanSubscribers(
      follower.mount(host),
      timeline.context.mount(),
      player.mount(),
      config.stage.subscribe(stage => {
        const old = config.rect.peek()
        config.rect.set({
          ...old,
          height: old.width / config.aspectRatio.value,
        })
      }),
      config.resizing.subscribe(resizing => {
        if (!resizing) {
          follower.styleHost()
        }
      }),
      stages.sharedControls.subscribe(stage => {
        const self = config.stage.peek()
        if (stage.mode != 'host' || self.mode == 'free') return

        // FIXME: no side effects
        cornerOffset = {
          ...originalCornerOffset,
          y: !bottom.includes(stage.selector!) ? 10 : originalCornerOffset.y,
        }
        if ([...bottom, ...top].includes(self.selector!)) {
          follower.trySwitchHost(stage.selector)
        }
      })
    )
  )
  const tiny = computed(() => config.rect.value.width <= 80)
  $: normal = $fullScreen || $rect.width > config.minWidth
  let any = '' as any

  // Because the follower hides the overflow
  // make the .progress-bar .scrubber-container visible
  const nudgeHeight = (nudge = 0) => {
    scrubbing.value = nudge != 0
    // const old = rect.peek()
    // rect.set({
    // 	...old,
    // 	height: old.width / config.aspectRatio.value + nudge,
    // })
  }
  const timelineTracker = createHoverTrack({
    mouseenter: () => nudgeHeight(5),
    mouseleave: () => nudgeHeight(),
  })
  const scrubbing = preSignal(false)
  const { progress } = timeline.progressBar
</script>

<div
  class="follower"
  use:useClass={{ resizing: config.resizing, fullScreen }}
  hidden
  use:registerFollower
  style:--video-width="{$rect.width}px"
  style:--video-aspect-ratio={config.aspectRatio.toString()}
>
  <!-- prettier-ignore -->
  <div
		class="followerContent"
	>
	<div
		class:mini={!normal}
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
		<Video on:mousedown={follower.dragThreshold} />

		{#if normal}
			<div class="video-controls-container bottom">
				<!-- <Timeline /> -->
				<Controls dragThreshold={follower.dragThreshold} />
			</div>
		{:else}
			<div class="miniPlayer" class:inactive={$progress.scrubbing || $scrubbing || !paused} class:tiny={$tiny}>
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
