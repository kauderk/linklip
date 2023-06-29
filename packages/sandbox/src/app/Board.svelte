<script lang="ts">
  import Template, { defineTemplate } from '../template/Template.svelte'
  import Storyboard from './Storyboard.svelte'
  import { mapRatio } from './timeline/ratio/map'
  import { Subscribe } from 'svelte-subscribe'
  import { preSignal } from '../lib/pre-signal'
  import { ignoreCssRules } from '$lib/no-invalidate'
  import { deriveScale } from './timeline/ratio/scale'
  import { getStoryboardContext } from './timeline/context'
  import { computed } from '@preact/signals-core'

  export let rect: any
  export let store = preSignal({ ratio: 0, playing: false })

  const data = getStoryboardContext()
  const scale = computed(() => deriveScale(rect.value, data.totalSize.value))

  const selector = 'button.storyboard-btn'
  const board = {
    activeIndex: preSignal<n | null>(null),
    previousIndex: preSignal<n>(-1),
  }
  const active = (target: HTMLElement, ratio: number) => ({
    update(ratio: number) {
      const tiles = Array.from(target.querySelectorAll(selector))
      // my math is inaccurate by 1 - log 1/2
      const ratioIndex = Math.floor(tiles.length * ratio)
      const index = board.activeIndex.value ?? ratioIndex
      const tile = tiles[index] as HTMLElement
      if (!tile) {
        return
      }
      board.activeIndex.value = null

      // update play head
      const edge = (i: n) => (ratioIndex + i) / tiles.length
      const progress = mapRatio(edge(0), ratio, edge(1))
      tile.style.setProperty('--progress', progress.toString())

      const previousTile = tiles[board.previousIndex.value]
      // TODO: how to allow only when there's a change or a repaint?
      // if (tile === previousTile) {
      // 	return console.log({ same: index, ratio })
      // }

      // show timer
      previousTile?.classList.remove('active', 'timer')
      tile.classList.add('active', 'timer')

      board.previousIndex.value = index
    },
  })

  let template = defineTemplate<{
    count: n
    relativeCount: n
    mouseleave?: (e: MouseEvent) => void
    mouseenter?: (e: MouseEvent) => void
  }>()
</script>

<div class="tiles" class:playing={$store.playing} use:active={$store.ratio}>
  <Template bind:template let:props>
    <button
      class="storyboard-btn"
      {...ignoreCssRules}
      on:click={() => {
        // my math is inaccurate by 1 - log 2/2
        board.activeIndex.value = props.relativeCount
        console.warn(`videoContext.seekTo.set(props.count)`)
      }}
      on:mouseleave={props.mouseleave}
      on:mouseenter={props.mouseenter}
    >
      <Subscribe {scale} let:scale>
        <Storyboard {scale} count={props.count} />
      </Subscribe>
      <div class="timer" />
    </button>
  </Template>
  <slot {template} />
</div>

<style lang="scss">
  .tiles {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background: black; // consistent opacity

    // the outline is hidden on the edges, fix that?
    transform: scale(0.95);

    .storyboard-btn {
      position: relative;
      opacity: 0.5;
      outline: 3px dotted transparent;

      &[preview] {
        outline-color: gray;
        opacity: 0.8;
      }

      &[selection] {
        z-index: 1;
        opacity: 0.8;
      }
      &[preview][selection] {
        outline-color: #00c5e8;
      }
      &[selection] {
        outline-color: #009cb8;
      }

      [selection='0'],
      &[selection='1'] {
        opacity: 0.9;
        z-index: 2;
      }
      &[selection='0'] {
        outline-color: green;
      }
      &[selection='1'] {
        outline-color: blueviolet;
      }

      &.active {
        opacity: unset;
        outline-style: solid;
        z-index: 3;
      }

      &:hover {
        outline: 3px dotted tomato;
        position: relative;
        z-index: 4;
      }

      .timer {
        background-color: #ff4e45;
        display: var(--display-timer, none);
        position: absolute;
        z-index: 4;

        height: 80%;
        width: var(--pad, 4px);

        left: calc(100% * var(--progress, 0));
        top: 10%;
      }
    }
    &.playing .storyboard-btn.timer .timer {
      display: block;
    }
  }
</style>
