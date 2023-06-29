<svelte:options accessors />

<script lang="ts">
  //#region imports
  import { onDestroy } from 'svelte'
  import { sharedState } from './store'
  import { createYtgifInsertOptions } from '../controls/dropdown/model/yt-gif/insert-options'
  import { style } from '$lib/svelte/styles'
  import { closestBlock } from '$v3/lib/dom/elements-yt-gif-parent'
  import { buffer, expression, deployListeners } from './actions'
  import { createYtgifFormatters } from '../controls/dropdown/model/yt-gif/formatters'
  import DropDown from '../controls/dropdown/DropDown.svelte'
  import Resize, { type size } from './Resize.svelte'
  import TimeDisplay from '../controls/TimeDisplay.svelte'
  import type { StaticPlayerParams } from '$v3/api-ready/types'
  import { createYtgifController, Props } from './controller'

  export let params: StaticPlayerParams
  export let uidResult: Props['uidResult']
  export let overrides: Props['overrides'] = undefined
  export let dirtyParams: Props['dirtyParams']
  export let lifeCycle = Props.lifeCycle
  //#endregion

  const api = createYtgifController({ dirtyParams, uidResult, lifeCycle, overrides })
  const { record, config, playerID, id, instance, store } = api.state
  const { control, deployed } = api.derived
  const { deploy, resetAction, destroy } = api
  $: ({ playerState, hover } = $control ?? {})

  // Resize
  let width: size
  let blinder: b

  onDestroy(destroy)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  class="yt-gif-wrapper-parent"
  use:deployListeners={[deploy]}
  on:mouseenter={hover?.play}
  on:mouseleave={hover?.stop}
>
  <div
    class="yt-gif-wrapper dont-focus-block {style(
      !$deployed,
      'yt-gif-awaiting-palyer--pulse-animation yt-gif-awaiting-for-user-input yt-gif-awaiting-for-user-input-with-thumbnail'
    )}"
    style:background-image={style(
      !$deployed,
      `url("https://img.youtube.com/vi/${id}/hqdefault.jpg`
    )}
    style:--yt-gif-player-span={width}
    data-target={params.targetClass}
    data-creation={params.dataCreation}
    data-video-url={uidResult.url}
    data-video-index={uidResult.accUrlIndex}
    use:buffer={store.canBeCleanedByBuffer}
    bind:this={instance.wrapper}
  >
    <div class="yt-gif-iframe-wrapper">
      <Resize
        height={sharedState.size.ytGifs}
        minWidth={sharedState.size.minWidth}
        maxWidth={el => closestBlock(el)?.clientWidth}
        bind:width
        onSize={size => (sharedState.size.ytGifs = size)}
        bind:resizing={blinder}
        {...overrides?.resize}
      >
        <!-- iframe -->
      </Resize>
      <div class="crop-correction">
        <div class="crop" style:width>
          <div id={playerID} class="yt-gif-player" />
        </div>
      </div>
    </div>
    <div class="yt-gif-controls">
      <slot>
        <DropDown data={createYtgifFormatters(() => instance)} />
      </slot>
      <!-- prettier-ignore -->
      <TimeDisplay control={$control} {config} tick={config.speed.tick} 
				bind:timeDisplay={instance.timeDisplay}
				let:interval>
				<js
					use:expression={$playerState == 'PLAYING'
						? interval.tryUpdate
						: interval.clear} />
			</TimeDisplay>
      <slot>
        <DropDown
          data={createYtgifInsertOptions({
            instance: () => instance,
            reset: { action: resetAction },
            t: () => record.wTarget,
          })}
        />
      </slot>
    </div>
    <!-- avoid a blocky feeling when working with iframes -->
    <div class:blinder />
  </div>
</span>

<style lang="scss">
  .yt-gif-wrapper-parent {
    user-select: none;
    .yt-gif-iframe-wrapper {
      overflow: hidden;
      .crop-correction {
        margin-top: -71.95%;
        margin-bottom: -20%;
        .crop {
          position: relative;
          overflow: hidden;
          // https://www.timeline.ly/
          // browser hide picture in picture label
          // https://stackoverflow.com/questions/52887444/hide-more-videos-within-youtube-iframe-when-stop-video
          padding-top: 200%;
        }
      }
    }
  }
  .blinder {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 10000;
    background: rgba(26, 25, 25, 0.235);
    display: block;
    :global(*) {
      pointer-events: none !important;
    }
  }
</style>
