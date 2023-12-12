<script lang="ts">
  import { createSvelteSignal } from '$lib/solid'
  import { onMount, tick } from 'svelte'
  import { resize, type ResizeConfig } from '../Resize.svelte'
  import { createMouseTrack } from '../controller/mouse-track'
  import { createDebouncedListener } from '$lib/resize'
  import type { ActionReturn } from '$lib/event-life-cycle'

  function portal(target: HTMLElement) {
    const host = document.querySelector('.whenContentEditable')!
    host.appendChild(target)
    updateSideRect()

    target.hidden = false
  }

  function updateSideRect() {
    const page = document.querySelector('.notion-page-content')!
    const block = page.querySelector('[data-block-id]')!.getBoundingClientRect()
    lookRect.maxWidth = block.left - 20
    lookRect.maxHeight = window.innerHeight - (lookRect.minHeight + 10)
  }

  function scrollHorizontally(e: any) {
    // temporary
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    const scrollSpeed = 60
    e.currentTarget.scrollLeft -= delta * scrollSpeed
    e.preventDefault()
  }

  function updateTopRect() {
    const hostRef = document.querySelector('.notion-topbar > div')!

    const startFrom = hostRef
      .querySelector('div.notranslate.shadow-cursor-breadcrumb')!
      .getBoundingClientRect()
    const endAt = hostRef.querySelector('div.notion-topbar-action-buttons')!.getBoundingClientRect()
    const hostRect = hostRef.getBoundingClientRect()
    // if the hostRect is at x:0, y: 0, width: 100, height: 30
    // return at x: 20%, y: 0, width: 60%, height: 30
    const xPadding = 0
    const rect = {
      left: startFrom.right + xPadding,
      top: hostRect.top,
      height: hostRect.height,
    }
    lookRect.maxWidth = Math.max(0, endAt.left - startFrom.right - xPadding)
    lookRect.minHeight = hostRef.clientHeight
    return rect
  }
  function topBarPortal(target: HTMLElement) {
    // CALC RECT
    const hostRef = document.querySelector('.notion-topbar > div')!

    const rect = updateTopRect()
    // PORTAL
    const sibling = hostRef.querySelector('.notion-topbar-action-buttons')!
    sibling.insertAdjacentElement('beforebegin', target)

    // POSITION
    target.style.position = 'fixed'
    Object.entries(rect).forEach(([key, value]) => {
      target.style[key as any] = `${value}px`
    })

    target.hidden = false
  }

  export let type: 'side' | 'top' = 'side'
  export let direction: 'left' | 'right' = 'left'

  export let size = 0
  export let w = 300
  export let rows = 1
  export let fixed = true
  export let lookRect = {
    minHeight: 45,
    maxWidth: w,
    maxHeight: 500,
    itemWidth: w,
    minWidth: 79,
  }

  const isTop = type == 'top'

  const resizeConfig = {
    resizeMode: isTop ? 'bottom' : 'right',
    bounds: 'rect',
    padding: 0,
    minWidth: 0,
    rect: createSvelteSignal({
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    }),
  } satisfies ResizeConfig

  function useRect(ref: HTMLElement) {
    const r = ref.getBoundingClientRect()
    resizeConfig.rect.write = {
      height: isTop ? lookRect.itemWidth / (16 / 9) : r.height,
      width: r.width || lookRect.itemWidth,
      x: r.left,
      y: r.top,
    }
    return {
      destroy: resizeConfig.rect.subscribe(rect => {
        const to = isTop ? 'height' : 'width'
        ref.style[to] = rect[to] + 'px'
      }),
    } satisfies ActionReturn
  }
  const overflow = createMouseTrack({
    mouseup(_, currentTarget) {
      const g = currentTarget.querySelector('.p-2')!
      const whole = isTop ? g.scrollWidth > g.clientWidth : g.scrollHeight > g.clientHeight
      currentTarget.classList.toggle('whole', whole)
      requestAnimationFrame(() => {
        if (isTop) {
          if (resizeConfig.rect.read.height < lookRect.minHeight) {
            resizeConfig.rect.mod({ height: lookRect.minHeight })
          }
        } else {
          if (resizeConfig.rect.read.width < lookRect.minWidth) {
            resizeConfig.rect.mod({ width: lookRect.minWidth })
          }
        }
      })
    },
  })

  const updateRect = isTop ? updateTopRect : updateSideRect
  onMount(() => createDebouncedListener(window, 'resize', updateRect))

  function branch(target: HTMLElement) {
    const gl = 'gallery-' + (isTop ? 'top' : direction)
    target.classList.add(gl)
    // @ts-expect-error
    target.branch = (id, add) => {
      if (size === 0 && !add) return
      size = size + (add ? 1 : -1)
      return tick()
    }
  }
</script>

{#if type == 'side'}
  <div
    style:--maxHeight={lookRect.maxHeight}
    style:--maxWidth={lookRect.maxWidth}
    style:--itemWidth={lookRect.itemWidth}
    class:fixed
    class:absolute={!fixed}
    class="gallery z-10 h-auto w-auto select-none opacity-30 {type}"
    style="{direction}: 0;"
    use:branch
    hidden
    use:portal
  >
    <div class="resizer relative {direction}" use:useRect on:mousedown={overflow}>
      <div
        class:justify-end={direction == 'right'}
        use:resize={resizeConfig}
        class="items grid w-full content-start gap-2 overflow-y-auto p-2"
        style="grid-template-columns: repeat({rows}, minmax(0, 1fr));"
      >
        {#each Array(size) as _, i}
          <div class="item block aspect-video w-full border border-slate-600 bg-slate-500">{i}</div>
        {/each}
      </div>
    </div>
  </div>
{:else if isTop}
  <div
    style:--maxWidth={lookRect.maxWidth}
    style:--itemWidth={lookRect.itemWidth}
    class="gallery {type}"
    use:topBarPortal
    use:branch
    hidden
  >
    <div
      class="resizer relative {type}"
      use:resize={resizeConfig}
      use:useRect
      on:mousedown={overflow}
    >
      <div
        class="items relative left-0 flex gap-2 overflow-x-auto p-2"
        style="width: inherit; height: inherit;"
        on:wheel={scrollHorizontally}
      >
        {#each Array(size) as _}
          <div
            class="item float-left block aspect-video h-full border border-slate-600 bg-slate-500"
          />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .gallery {
    &:global(.fixed .grid) {
      max-height: calc(var(--maxHeight) * 1px);
    }
    .resizer,
    .grid {
      height: auto;
    }
    &:global(.absolute :is(.resizer, .grid)) {
      height: inherit;
    }
    .resizer {
      &:global(.whole) {
        &.left :global(.grabber.right),
        // &.right :global(.grabber.left),
        &.top :global(.grabber.bottom) {
          --grabber-offset: -10px;
        }
      }
      &:global(.top:not(.whole) .relative) {
        overflow-x: hidden;
      }
      max-width: calc(var(--maxWidth) * 1px);
      &:not(:hover) {
        &::-webkit-scrollbar-thumb {
          background: transparent !important;
        }
      }
    }
  }
</style>
