<script lang="ts">
  import { preSignal } from '$lib/pre-signal'
  import { resize, type ResizeConfig } from '../Resize.svelte'
  import { createMouseTrack } from '../controller/mouse-track'

  function portal(target: HTMLElement) {
    const host = document.querySelector('.whenContentEditable')!
    host.appendChild(target)
    const page = document.querySelector('.notion-page-content')!
    const block = document.querySelector('[data-block-id]')!
    lookRect.maxWidth = (page.clientWidth - block.clientWidth) / 2

    target.hidden = false
  }

  function scrollHorizontally(e: any) {
    // temporary
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    const scrollSpeed = 60
    e.currentTarget.scrollLeft -= delta * scrollSpeed
    e.preventDefault()
  }

  function topBarPortal(target: HTMLElement) {
    // CALC RECT
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
      'max-width': Math.max(0, endAt.left - startFrom.right - xPadding),
      height: hostRect.height,
    }
    lookRect.maxWidth = rect['max-width']
    lookRect.minHeight = hostRef.clientHeight

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

  export let size = 10
  export let w = 200
  export let rows = 1
  export let lookRect = {
    minHeight: 45,
    maxWidth: w,
    itemWidth: w,
  }

  const resizeConfig = {
    resizeMode: type == 'top' ? 'bottom' : 'right',
    bounds: 'none',
    padding: 0,
    minWidth: 0,
    rect: preSignal({
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    }),
  } satisfies ResizeConfig

  function useRect(ref: HTMLElement) {
    const r = ref.getBoundingClientRect()
    resizeConfig.rect.set({
      height: type == 'top' ? lookRect.itemWidth / (16 / 9) : r.height,
      width: r.width || lookRect.itemWidth,
      x: r.left,
      y: r.top,
    })
    return {
      destroy: resizeConfig.rect.subscribe(rect => {
        const to = type == 'top' ? 'height' : 'width'
        ref.style[to] = rect[to] + 'px'
      }),
    }
  }
  const overflow = createMouseTrack({
    mouseup(_, currentTarget) {
      // annoying
      const r = currentTarget.getBoundingClientRect()
      const noOverflow = r.width < lookRect.maxWidth
      currentTarget.classList.toggle('noOverflow', noOverflow)
      requestAnimationFrame(() => {
        if (resizeConfig.rect.value.height < lookRect.minHeight) {
          const offset = noOverflow ? 0 : 10
          resizeConfig.rect.mod({ height: lookRect.minHeight + offset })
        }
      })
    },
  })
</script>

{#if type == 'side'}
  <div
    style:--maxWidth={lookRect.maxWidth}
    style:--itemWidth={lookRect.itemWidth}
    class="gallery absolute z-10 h-full w-auto select-none overflow-hidden opacity-30 {type}"
    style={`${direction}: 0;`}
    hidden
    use:portal
  >
    <div
      class="resizer relative"
      style="height: inherit;"
      use:resize={resizeConfig}
      use:useRect
      on:mousedown={overflow}
    >
      <div
        class:justify-end={direction == 'right'}
        class="grid w-full grid-cols-2 content-start gap-2 overflow-y-auto p-2"
        style="grid-template-columns: repeat({rows}, minmax(0, 1fr)); height: inherit;"
      >
        {#each Array(size) as _, i}
          <div class="item block aspect-video w-full border border-slate-600 bg-slate-500">{i}</div>
        {/each}
      </div>
    </div>
  </div>
{:else if type == 'top'}
  <div class="gallery {type}" use:topBarPortal hidden style:--itemWidth={lookRect.itemWidth}>
    <div class="resizer relative" use:resize={resizeConfig} use:useRect on:mouseup={overflow}>
      <div
        class="relative left-0 flex gap-2 overflow-x-auto overflow-y-hidden p-2"
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
  .resizer {
    :global([class*='bottom']) {
      --grabber-offset: -10px;
    }
    &:global(.noOverflow .relative) {
      overflow-x: hidden;
    }
  }
  .gallery > div {
    max-width: calc(var(--maxWidth) * 1px);
  }
  .gallery > div:not(:hover) {
    &::-webkit-scrollbar-thumb {
      background: transparent !important;
    }
  }
</style>
