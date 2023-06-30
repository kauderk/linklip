<script lang="ts">
  import { preSignal } from '$lib/pre-signal'
  import { resize, type ResizeConfig } from '../Resize.svelte'

  function portal(target: HTMLElement) {
    const host = document.querySelector('.whenContentEditable')!
    host.appendChild(target)

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

  export let type = 'side'
  export let direction = 'left'

  export let size = 10
  export let w = 200
  export let lookRect = {
    minHeight: 45,
    maxWidth: w,
    itemWidth: w,
  }

  const resizeConfig = {
    resizeMode: 'bottom',
    bounds: 'rect',
    padding: 0,
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
      height: lookRect.itemWidth / (16 / 9),
      width: r.width,
      x: r.left,
      y: r.top,
    })
    return {
      destroy: resizeConfig.rect.subscribe(rect => {
        ref.style.height = rect.height + 'px'
      }),
    }
  }
  function overflow(e: any) {
    // annoying
    const r = e.currentTarget.getBoundingClientRect()
    const noOverflow = r.width < lookRect.maxWidth
    e.currentTarget.classList.toggle('noOverflow', noOverflow)
    requestAnimationFrame(() => {
      if (resizeConfig.rect.value.height < lookRect.minHeight) {
        const offset = noOverflow ? 0 : 10
        resizeConfig.rect.mod({ height: lookRect.minHeight + offset })
      }
    })
  }
</script>

{#if type == 'side'}
  <div
    style:--maxWidth={lookRect.maxWidth}
    style:--itemWidth={lookRect.itemWidth}
    class="gallery absolute z-10 h-full w-auto overflow-hidden opacity-30 {type}"
    style={`${direction}: 0;`}
    hidden
    use:portal
  >
    <div
      class:justify-end={direction == 'right'}
      class="left-0 flex w-fit flex-wrap content-start items-start gap-2 overflow-y-auto p-2"
      style="height: inherit;"
    >
      {#each Array(size) as _}
        <div class="item block aspect-video border border-slate-600 bg-slate-500" />
      {/each}
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
  .gallery.side > div {
    max-width: calc(var(--maxWidth) * 1px);
  }
  .gallery.side .item {
    width: calc(var(--itemWidth) * 1px);
  }
  .gallery > div:not(:hover) {
    &::-webkit-scrollbar-thumb {
      background: transparent !important;
    }
  }
</style>
