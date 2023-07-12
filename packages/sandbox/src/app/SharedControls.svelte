<script lang="ts">
  import { onMount } from 'svelte'
  import { follower as setSharedControlsContext } from './controller/follower'
  import type { FollowerConfig } from './controller/follower-lib'
  import { cleanSubscribers } from '$lib/stores'
  import { preSignal } from '$lib/pre-signal'
  import { defaultCornerFollowerCycle, observerSelectors } from './follower/corner'
  import Controls from './Controls.svelte'
  import { createDefaultStage, getStagesContext } from './follower/store'
  import { selectorsFuncs } from './follower/selectors'

  const width = 600
  const height = 70
  const config = {
    selectors: {
      notionPage: {
        selector: {
          target: '.notion-page-content',
          panicToLast: true,
        },
        observerSelectors,
        followerCycle: defaultCornerFollowerCycle,
      },
      notionTopBar: {
        selector: {
          target: '.notion-topbar > div',
          panicToLast: true,
        },
        followerCycle: {
          // prettier-ignore
          update(hostRef, initRect) {
            return {
              value() {
                const startFrom = hostRef.querySelector('div.notranslate.shadow-cursor-breadcrumb')!.getBoundingClientRect()
                const endAt = hostRef.querySelector('div.notion-topbar-action-buttons')!.getBoundingClientRect()
                const hostRect = hostRef.getBoundingClientRect()
                // if the hostRect is at x:0, y: 0, width: 100, height: 30
                // return at x: 20%, y: 0, width: 60%, height: 30
                const xPadding = 15
                return {
                  x: startFrom.right + xPadding,
                  y: hostRect.top,
                  width: Math.max(0, endAt.left - startFrom.right - xPadding),
                  height: hostRect.height,
                }
              },
            }
          },
        },
      },
      notionMainScroller: {
        selector: {
          target: '.notion-scroller main',
          panicToLast: true,
        },
        followerCycle: {
          update(hostRef, initRect) {
            return {
              value() {
                return selectorsFuncs.notionMainScroller.update(hostRef)
              },
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
    stage: createDefaultStage(),
  } satisfies FollowerConfig

  const follower = setSharedControlsContext(config)
  const stages = getStagesContext()
  const { registerFollower } = follower

  onMount(() =>
    cleanSubscribers(
      follower.mount(document.querySelector(config.selectors.notionMainScroller.selector.target)!),
      config.stage.subscribe(stage => {
        stages.sharedControls.set(stage)
      })
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
