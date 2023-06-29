<script lang="ts" context="module">
  export type size = `${string}px`
  export const getMinSize = (height: size) => parseFloat(height) * (16 / 9)
  const cords = {
    'bottom-center': {
      origin: (e: MouseEvent) => e.pageY,
      offset: (e: MouseEvent, origin: n) => e.pageY - origin,
    },
    'bottom-right': {
      origin: (e: MouseEvent) => e.pageX,
      offset: (e: MouseEvent, origin: n) => e.pageX - origin,
    },
  }
</script>

<!-- https://codepen.io/ZeroX-DG/pen/vjdoYe -->
<script lang="ts">
  import { sleep } from '$lib/utils'
  import { onDestroy } from 'svelte'
  import { windowResizeEventStore } from './resize'

  let element: HTMLElement

  export let height: size
  export let minWidth = getMinSize(height)
  export let maxWidth: (el: QrySearch) => n | undefined
  export let width: size = `${getMinSize(height)}px`
  export let onSize = (size: size) => {}

  let widthSample = 0
  let origin = 0
  export let resizing = false
  export let keyCord: keyof typeof cords = 'bottom-right'
  export let onAwkwardResize: ((resizing: b) => void) | undefined = undefined

  function parse(p: s) {
    return parseFloat(getComputedStyle(element, null).getPropertyValue(p).replace('px', ''))
  }
  function beginResizing(e: MouseEvent) {
    widthSample = parse('width')
    origin = cords[keyCord].origin(e)
    onAwkwardResize?.(true)
    window.addEventListener('mousemove', resize)
    stopFutureResize()
  }
  function resize(e: MouseEvent) {
    resizing = true
    const w = widthSample + cords[keyCord].offset(e, origin)

    if (w > minWidth + 10) {
      set(w)
    }
  }
  function set(w: number) {
    width = `${w}px`
    height = `${w * (9 / 16)}px`
    onSize(height)
  }
  function stopResizing() {
    window.removeEventListener('mousemove', resize)
    // give a chance to the DropDownMenu.svelte's
    // Content onClickOutside event to go by
    sleep(500).then(() => onAwkwardResize?.(false))
    resizing = false
  }
  function stopFutureResize() {
    window.addEventListener('mouseup', stopResizing, { once: true })
  }
  function tryStopResizing() {
    resizing && stopResizing()
  }

  $: if ($windowResizeEventStore) {
    const parent = maxWidth(element)
    const self = parseFloat(width)
    if (parent && parent < self) {
      stopFutureResize()
      set(parent)
    } else if (parent && self < minWidth - 1) {
      stopFutureResize()
      set(parent > minWidth ? minWidth : parent)
    }
  }

  onDestroy(() => {
    window.removeEventListener('mousemove', resize)
    window.removeEventListener('mouseup', stopResizing)
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="resizable" bind:this={element} style:width style:height on:mouseup={tryStopResizing}>
  <slot />
  <div class="resizers">
    {#each [keyCord] as cord}
      <div
        class="resizer {cord}"
        class:resizing
        on:keydown={e => e.key == 'Escape' && tryStopResizing()}
        on:mousedown|stopPropagation={beginResizing}
      />
      <!-- avoid firing the yt-gif -->
    {/each}
  </div>
</div>

<style lang="scss">
  .resizable {
    position: absolute;
    display: flex; /*weird*/
    border-radius: 0.5em;
    .resizers {
      width: 100%;
      height: 100%;
      border: 3px solid rgb(53, 53, 53);
      box-sizing: border-box;
      .resizer {
        width: 10px;
        aspect-ratio: 1 / 1;
        border-radius: 50%;

        border: 3px solid transparent;
        position: absolute;
        &.resizing,
        &:hover {
          border-color: rgb(26, 56, 105);
          background: white;
        }
        &.bottom-right {
          right: -5px;
          bottom: -5px;
          cursor: nwse-resize;
        }
        &.bottom-center {
          right: 50%;
          bottom: -5px;
          cursor: ns-resize;
        }
      }
    }
  }
</style>
