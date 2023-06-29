<script lang="ts">
  import { onMount } from 'svelte'
  import { type FollowerConfig, follower as setSharedControlsContext } from './controller/follower'
  import { cleanSubscribers } from '$lib/stores'
  import SVG from './SVG.svelte'
  import { preSignal } from '$lib/pre-signal'
  import { defaultCornerFollowerCycle, observerSelectors } from './follower/corner'
  import Controls from './Controls.svelte'

  const width = 600
  const height = 70
  const config = {
    selectors: {
      notionPage: {
        selector: '.notion-page-content',
        observerSelectors,
        panicToLastHost: true,
        followerCycle: defaultCornerFollowerCycle,
      },
      notionTopBar: {
        selector: '.notion-topbar > div',
        panicToLastHost: true,
        canIntersect: false,
        followerCycle: {
          ...defaultCornerFollowerCycle,
          // prettier-ignore
          update(hostRef, initRect) {
						const startFrom = hostRef.querySelector('div.notranslate.shadow-cursor-breadcrumb')!.getBoundingClientRect()
						const endAt = hostRef.querySelector('div.notion-topbar-action-buttons')!.getBoundingClientRect()
						const hostRect = hostRef.getBoundingClientRect()
						// if the hostRect is at x:0, y: 0, width: 100, height: 30
						// return at x: 20%, y: 0, width: 60%, height: 30
						const xPadding = 15
						return {
							value: {
								x: startFrom.right+xPadding,
								y: hostRect.top,
								width: Math.max(0, (endAt.left - startFrom.right)-xPadding),
								height: hostRect.height,
							},
							mode: 'new',
							hostRef,
							canIntersect: false,
						}
					},
        },
      },
      notionMainScroller: {
        selector: '.notion-scroller main',
        panicToLastHost: true,
        canIntersect: false,
        followerCycle: {
          ...defaultCornerFollowerCycle,
          update(hostRef, initRect) {
            const hostRect = hostRef.getBoundingClientRect()
            const height = 50
            const width = Math.min(1000, hostRect.width)
            // center it vertically, max width 1000 and 50 height at the bottom
            return {
              value: {
                x: window.innerWidth / 2 - width / 2,
                y: window.innerHeight - height,
                width,
                height,
              },
              mode: 'new',
              hostRef,
              canIntersect: false,
            }
          },
        },
      },
    },
    width,
    rect: preSignal({
      x: window.innerWidth / 2 - width / 2,
      y: window.innerHeight / 2 - height / 2,
      width,
      height,
    }),
  } satisfies FollowerConfig

  const follower = setSharedControlsContext(config)
  const { registerFollower } = follower

  onMount(() =>
    cleanSubscribers(
      follower.mount(document.querySelector(config.selectors.notionMainScroller.selector)!)
    )
  )
</script>

<div class="shared-controls" hidden use:registerFollower>
  <Controls dragThreshold={follower.dragThreshold} />
</div>

<style lang="scss">
  .shared-controls:global(:not([data-follower='notionPage'])) {
    z-index: 102;
  }
  .shared-controls {
    background-color: #272727;
    border: 3px solid #202020;
    border-radius: 10px;
    // padding: 0.5em;
    position: fixed;
    z-index: 100;
    color: whitesmoke;

    &:global(.pointer) {
      opacity: 0.5 !important;
      pointer-events: none !important;
      outline: 10px var(--outline-style) red;
    }
  }
</style>
