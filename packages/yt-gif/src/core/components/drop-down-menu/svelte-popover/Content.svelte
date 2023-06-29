<script lang="ts">
  import { clickOutside } from '$lib/svelte/actions'
  import Arrow from '$v3/components/drop-down-menu/BlueprintJS/Arrow.svelte'
  import { windowResizeEventStore } from '$v3/components/yt-gif/player/resize'
  import { tick } from 'svelte'
  import { DropDownMenuConfig } from './context'

  export let overflow = false
  const props = DropDownMenuConfig.wrapperCtx.contentCtx.props
  const layout = DropDownMenuConfig.layout

  let contentRef: HTMLDivElement
  let arrowRef: HTMLElement

  type f = s | null
  type TP = {
    top: f
    left: f
  }
  let positionStyle = <TP>{}
  type TA = {
    transform: string
    top: f
    left: f
    right: f
  }
  let arrowStyleProps = <TA>{}

  function calculate() {
    const targetBound =
      // @ts-ignore
      DropDownMenuConfig.wrapperCtx.contentCtx.targetRef.getBoundingClientRect()
    const contentBound = contentRef.getBoundingClientRect()
    const arrowBound = $props.arrow ? arrowRef.getBoundingClientRect() : { width: 0, height: 0 }

    const { innerWidth, innerHeight } = window

    // prevent X overflow
    const calcTopBottomCenter =
      targetBound.left + targetBound.width / $props.offset.bottom.center.x - contentBound.width / 2
    const leftRopBottomCenter = calcTopBottomCenter < 0 ? 0 : calcTopBottomCenter

    const computearrowH = arrowBound.height / 2

    type C = {
      top: number
      left?: number
    }

    const CTL = ({ top, left }: C) => ({
      top: top ? top + 'px' : null,
      left: left ? left + 'px' : null,
    })
    type A = {
      transform: string
      top: number
      left: number | null
      right?: number
    }

    const TTL = ({ transform, top, left, right }: A) => ({
      transform,
      top: top ? top + 'px' : null,
      left: left ? left + 'px' : null,
      right: right ? right + 'px' : null,
    })
    const content = <const>{
      bottomCenter: {
        top: targetBound.height + computearrowH + targetBound.top,
        left:
          targetBound.left + contentBound.width / 2 > innerWidth
            ? innerWidth - contentBound.width
            : leftRopBottomCenter,
      },
    }
    const arrow = <const>{
      bottomCenter: {
        transform: `transform:rotate(-45deg)`,
        top: Math.ceil(-arrowBound.height / 2) + content.bottomCenter.top,
        left: contentBound.width / 2 - arrowBound.width / 3.75 + calcTopBottomCenter,
      },
    }
    positionStyle = CTL(content.bottomCenter)
    arrowStyleProps = TTL(arrow.bottomCenter)
    overflow = contentBound.bottom > innerHeight
  }
  function tryCalculate() {
    if (
      (!!contentRef && !!arrowRef && !!DropDownMenuConfig.wrapperCtx.contentCtx.targetRef) ||
      !layout.hidden
    ) {
      calculate()
    }
  }

  $: if ($windowResizeEventStore) {
    tick().then(tryCalculate)
  }
</script>

<svelte:window on:keydown={calculate} />

<div
  use:clickOutside
  on:clickOutside
  bind:this={contentRef}
  class="content"
  style:top={positionStyle.top}
  style:left={positionStyle.left}
  style:z-index={layout.zIndex + 2}
>
  <slot {tryCalculate} />
</div>

{#if $props.arrow}
  <Arrow bind:arrowRef {...arrowStyleProps} />
{/if}

<style>
  .arrow {
    position: absolute;
    top: 0;
  }
  .content {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
