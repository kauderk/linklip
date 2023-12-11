<script lang="ts">
  import Storyboard from './Storyboard.svelte'
  import Line from './Line.svelte'
  import Board from './Board.svelte'
  import { Subscribe } from 'svelte-subscribe'
  import { getTimelineContext } from './timeline/controller'
  let ignoreCssRules = { ['ignoreCssRules']: '' }
  import { heatmap } from '$mock/heatmap.json'
  import { createScrubber } from './timeline/scrubber'
  import { onMount } from 'svelte'
  import { createRangeSlider } from './timeline/slider'
  import { cleanSubscribers } from '$lib/stores'
  import { mapTiles } from './timeline/ratio/compute'
  import { createSvelteMemo } from '$lib/solid'
  import { createSvelteSignal } from '$lib/solid'
  import { resizeAction } from '$lib/resize'

  const { shared, progressBar, slider } = getTimelineContext()
  const {
    actions: { stateAction, processContextMenu },
    staleValues,
    ratios,
    rangeContext,
    sharedFocus,
  } = shared
  const {
    time: { progress: active, preview },
    events,
    boundaryAction,
    progress,
  } = progressBar
  const { sliderHeight } = slider

  const scrubber = createScrubber(progress)
  const { useTimelineRef } = scrubber
  const { diffBoundaries, boundaries } = rangeContext.derivedRatios

  const {
    focus,

    // actions
    useSlider,
    useSliderSet,
    registerHandleEvent,
    registerRangeEvent,
  } = createRangeSlider({
    guard: (e, index) => e.which == 1 && rangeContext.states[index].edit.peek() != 'lock',
    rangeContext,
    calculateValue(pair: any, index: number) {
      const start = pair.start || 0
      const end = pair.end || 100
      const boundary = { startRatio: start / 100, endRatio: end / 100 }
      // onTick
      boundaries[index].set(boundary)
      diffBoundaries[index].tryInvalidate({
        boundary,
        progress: progress.peek(),
      })
      return {
        start,
        end,
        handles: Object.keys(pair),
      }
    },
  })

  onMount(() =>
    cleanSubscribers(
      focus.subscribe(focus => (sharedFocus.value = focus)),
      sharedFocus.subscribe(() => {
        rangeContext.derivedRatios.diffRatios.forEach((diff, i) => {
          diff.set(mapTiles(boundaries[i].peek()))
          // Notify the <Board /> that there are new tiles
          diffBoundaries[i].progress.update($ => $)
        })
      })
    )
  )
  const sliderRect = createSvelteSignal({ width: 300, height: 90 })
  const resizing = createSvelteSignal(false)
  const windowResize = createSvelteSignal(false)
</script>

<div
  class="progress-bar"
  on:mousedown={progressBar.trackVerticalResize}
  on:mousedown={scrubber.trackMouse}
  on:mousemove={scrubber.mousemove}
  style:--preview-position={$progress.preview}
  style:--progress-position={$progress.progress}
  on:contextmenu={e => {
    processContextMenu(e, '.chapters')
  }}
>
  <div class="preview-img" {...ignoreCssRules}>
    <Storyboard percentage={$progress.preview} />
  </div>
  <div class="scrubber-time">
    {$active}
  </div>
  <div class="preview-time">
    {$preview}
  </div>
  <div class="chapters">
    {#each $staleValues as pair, index (pair)}
      {@const boundary = ratios.boundaries[index]}
      <div
        class="chapter-hover-container"
        style:--index={index}
        use:boundaryAction={index}
        use:stateAction={index}
      >
        <div class="handles">
          {#each ['start', 'end'] as step}
            <div class="handle" id={step}>
              <div
                class="grip"
                on:mousedown={e => {
                  if (e.which != 1) {
                    return
                  }
                  e.preventDefault()
                  e.stopPropagation()
                  events[index].handle(e, { step })
                }}
                on:blur={events[index].blur}
              >
                01:30
              </div>
            </div>
          {/each}
        </div>
        {#if $sliderRect.width > 400}
          <div class="heatmap">
            <Line {heatmap} chapter={boundary} />
          </div>
        {/if}
        <div class="progress-bar-padding" />
        <div
          class="progress-list"
          on:mousedown={e => {
            if (!e.ctrlKey) {
              return
            }
            e.preventDefault()
            e.stopPropagation()
            events[index].range(e)
          }}
          on:blur={events[index].blur}
        >
          <Subscribe batch={ratios.diffBoundaries[index].batch} let:batch>
            <!-- FIXME: the types are all wrong -->
            <div class="load-progress" style:transform="scaleX({0})" />
            <div
              class="hover-progress hover-progress-light"
              style:transform="scaleX({batch.preview.ratio})"
            />
            <div
              class="play-progress swatch-background-color"
              style:transform="scaleX({batch.progress.ratio})"
            />
          </Subscribe>
        </div>
      </div>
    {/each}
  </div>
  <div class="scrubber-container">
    <div class="scrubber-button swatch-background-color">
      <div class="scrubber-pull-indicator" />
    </div>
  </div>
  <div class="chapter-hover-container background">
    <div class="progress-list" />
  </div>
</div>

<svelte:body
  use:resizeAction={[
    rect => {
      //sliderRect.set(rect)
    },
    windowResize,
  ]}
/>
<div
  class="fine-scrubbing-container"
  style:--slider-size="{$sliderHeight}px"
  on:contextmenu={e => {
    scrubber.mousemove(e)
    processContextMenu(e, '.slider')
  }}
>
  <!-- add: disabled focus to satisfy svelte scss -->
  <div
    class="slider disabled focus"
    use:useSlider
    use:resizeAction={[
      rect => {
        sliderRect.set(rect)
      },
      resizing,
    ]}
    use:useTimelineRef
  >
    {#each $staleValues as pair, index (pair)}
      <!-- <js _={console.log('render pair', index)} /> -->
      <div
        class="slider-set"
        use:stateAction={index}
        use:useSliderSet={index}
        style:--index={index}
      >
        <div class="set">
          <div
            class="storyboard-max"
            class:hidden={$sharedFocus || $resizing || $progress.scrubbing || $windowResize}
          >
            <Board rect={sliderRect} store={ratios.diffBoundaries[index].progress} let:template>
              <!-- FIXME: the types are all wrong -->
              <Subscribe tiles={createSvelteMemo(() => ratios.diffRatios[index].value)} let:tiles>
                {#each Array(tiles.size) as _, relativeCount (relativeCount)}
                  <svelte:component
                    this={template}
                    count={tiles.offsetCount + relativeCount}
                    {relativeCount}
                  />
                {/each}
                <js _={slider.updateBoard(index)} />
              </Subscribe>
            </Board>
          </div>
        </div>
        {#each Object.entries(pair) as [step, entry]}
          {@const active = false}
          <span
            class="handle"
            id={step}
            class:active={$focus && active}
            class:press={active}
            style:z-index={active ? 3 : 2}
            style:--entry={entry}
            use:registerHandleEvent={{ index, step }}
          />
        {/each}
        {#if Object.keys(pair).length > 1}
          <span class="slider-bar" class:active={false} use:registerRangeEvent={{ index }} />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .progress-bar {
    @extend .fill;
    --height: 4px;
    height: var(--height, 0.5em);
    position: relative;

    .fade {
      opacity: 0;
      transition: opacity 0.25s;
    }
    &:hover {
      .fade {
        opacity: 1;
      }
    }

    --unit: 6.5px;
    --chunk: calc(var(--unit) * 2);
    font-size: 0.8em;
    .preview-img {
      position: absolute;
      height: 80px;
      aspect-ratio: var(--video-aspect-ratio, 16 / 9);
      top: calc((var(--chunk) + 3em) * -1);
      transform: translate(-50%, -100%);
      left: calc(var(--preview-position) * 100%);
      border-radius: 0.25rem;
      border: 2px solid white;
      pointer-events: none;

      @extend .fade;
    }

    .preview-time,
    .scrubber-time {
      position: absolute;
      width: auto;
      transform: translate(-50%, calc(-100% - var(--chunk)));

      border: 1px solid white;
      border-radius: var(--unit);
      padding-inline: 0.35em;
      cursor: default;
      pointer-events: none;

      @extend .fade;
    }
    .scrubber-time {
      background: rgba(128, 128, 128, 0.179);
      filter: brightness(0.6);
      left: calc(var(--progress-position) * 100%);
    }
    .preview-time {
      background: black;
      left: calc(var(--preview-position) * 100%);
    }

    --thumb: 0;
    .scrubber-container {
      --tip: var(--height);

      position: absolute;
      top: calc(var(--tip) * -2);
      // playProgress
      right: calc(100% - var(--progress-position, 0) * 100%);
      top: 50%;
      transform: translate(var(--unit), calc(var(--unit) * -1));
      &:hover {
        --thumb: 1;
      }

      .scrubber-button {
        width: var(--chunk);
        aspect-ratio: 1 / 1;
        border-radius: var(--unit);
        transition: transform 0.1s cubic-bezier(0.4, 0, 1, 1);
        transform: scale(var(--thumb));

        .scrubber-pull-indicator {
          position: absolute;
          bottom: calc(var(--unit) + var(--tip));
          left: var(--unit);
          transform: rotate(45deg);
          &:before,
          &:after {
            display: block;
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            opacity: 0;
            width: var(--unit);
            aspect-ratio: 1 / 1;
            border-style: solid;
            border-width: var(--tip) 0 0 var(--tip);
            border-color: #eaeaea;
            transition: all 0.1s;
          }
        }
      }
    }

    .chapters .chapter-hover-container {
      top: 0;
      left: var(--left);
      right: var(--right);
      --size: var(--h);
      --pad: 4px;
      --ratio: 1;

      .handles * {
        display: none; // FIXME: take into account smaller containers
        opacity: 0;

        &:hover {
          opacity: 1;
        }
      }
      &[data-state='focus'] {
        .handles * {
          opacity: 1 !important;
        }
      }
      &[data-state='lock'] {
        filter: brightness(0.5);
        .handles * {
          display: none;
        }
      }

      .handle {
        --h: calc(var(--chunk) * 1.5);
        --w: 2px;
        position: absolute;
        height: var(--h);
        width: var(--w);
        bottom: 0px;
        cursor: ew-resize;
        transition: opacity 0.4s;

        *,
        & {
          background: rgba(255, 0, 0, 0.271);
        }

        &#start {
          left: 0;
          --x: 1;
          transform: translateX(calc(-50% - var(--w)));
        }
        &#end {
          right: 0;
          --x: 0;
          transform: translateX(calc(-50% + var(--w)));
        }
        .grip {
          transform: translate(calc(-100% * var(--x)), calc(var(--h) * -1));
          width: fit-content;
          position: relative;
          transition: opacity 0.2s;
        }
      }
    }
    &:hover {
      --height: 6px;
      --thumb: 0.3;
      .chapter-hover-container:hover {
        top: -25%;
        --height: 8px;
      }
    }
    .chapter-hover-container {
      --h: var(--height, 0.5em);
      height: var(--h);
      position: absolute;

      &.background {
        @extend .fit;
        float: left;
        width: 100%;
        position: absolute;
        pointer-events: none;
      }

      .heatmap {
        @extend .fill;
        height: 1.5em;
        bottom: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.1s;
        &.hover {
          opacity: 1;
        }
      }
      .progress-bar-padding {
        @extend .fill;
        position: absolute;
        height: calc(var(--h) * 2.5);
        transform: translateY(calc((var(--h) * 0.7) * -1));
      }
      &:hover {
        .heatmap {
          opacity: 1;
        }
      }

      .progress-list {
        @extend .fit;
        background: rgba(255, 255, 255, 0.2);
        // transform: scaleY(0.6);
        transition: transform 0.1s cubic-bezier(0.4, 0, 1, 1);

        > div {
          @extend .fill;
          height: 100%;
          left: 0;
          bottom: 0;
          transform-origin: 0 0;
        }

        .play-progress,
        .hover-progress {
          transform: scaleX(0);
        }
        //
        .load-progress {
          background: rgba(255, 255, 255, 0.4);
        }
        //
        .hover-progress {
          background: rgba(0, 0, 0, 0.125);
          opacity: 0;
          transition: opacity 0.25s cubic-bezier(0, 0, 0.2, 1);
        }
        .hover-progress-light {
          opacity: 1;
          background: rgba(255, 255, 255, 0.5);
        }
      }
    }

    // TODO: better way to do show an off state
    &:has(.handle:hover) {
      .preview-time,
      .scrubber-time {
        opacity: 0 !important;
      }
    }

    // utils
    div {
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
    }
    .fill {
      position: absolute;
      width: 100%;
    }
    .fit {
      position: relative;
      height: 100%;
    }
    .swatch-background-color {
      background-color: #f00;
    }
  }

  .slider {
    --size: var(--slider-size, 250px);
    --gap: calc(var(--size) + 20px);
    --pad: 2px;

    position: relative;
    height: var(--size);

    * {
      user-select: none;
    }

    &.disabled {
      opacity: 0.5;
      .handle {
        background: var(--background);
      }
    }
    &.focus .slider-bar.active {
      background: saturationPercentage(50%);
    }

    .slider-set {
      &:has(.selectable-active) {
        filter: hue-rotate(180deg);
      }
      &:has(.selectable-hover) {
        filter: hue-rotate(90deg);
      }

      // it's purpose is to hold computed css variables
      @function saturationPercentage($saturation) {
        @return hsl(var(--percentage), $saturation, 50%);
      }

      position: absolute;
      top: 0;
      left: var(--left);
      right: var(--right);
      height: var(--size);

      .handle {
        position: absolute;
        &#start {
          left: 0;
        }
        &#end {
          right: 0;
        }
        --ratio: 1;
        height: calc(var(--size) * var(--ratio));
        width: var(--pad);

        cursor: ew-resize;

        background: saturationPercentage(30%);

        &.active {
          background: saturationPercentage(60%);
        }
        &:focus {
          outline: none;
        }
        &:focus-visible {
          outline: 2px solid #334;
        }
      }
      .slider-bar {
        width: inherit;
        height: inherit;
        display: inherit;
      }
      .storyboard-max {
        height: 100%;
        max-height: var(--slider-size);
        width: 100%;
        overflow: hidden;
        position: absolute;
        pointer-events: none;
      }
    }
  }
  :global(.slider-set[data-state='lock']) {
    filter: brightness(0.5);
    .handle {
      cursor: not-allowed;
    }
  }
</style>
