<script lang="ts">
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
      width: Math.max(0, endAt.left - startFrom.right - xPadding),
      height: hostRect.height,
    }

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
  export let w = 320
  export let rect = {
    maxWidth: w,
    itemWidth: w,
  }
</script>

{#if type == 'side'}
  <div
    style:--maxWidth={rect.maxWidth}
    style:--itemWidth={rect.itemWidth}
    class="gallery absolute z-10 h-full w-auto overflow-hidden opacity-30 {type}"
    style={`${direction}: 0;`}
    hidden
    use:portal
  >
    <div
      class:justify-end={direction == 'right'}
      class="left-0 flex w-fit flex-wrap items-start gap-2 overflow-y-auto p-2"
      style="height: inherit;"
    >
      {#each Array(size) as _}
        <div class="item block aspect-video border border-slate-600 bg-slate-500" />
      {/each}
    </div>
  </div>
{:else if type == 'top'}
  <div class="gallery {type}" use:topBarPortal hidden style:--itemWidth={rect.itemWidth}>
    <div
      class=" absolute left-0 flex gap-2 overflow-x-auto p-2"
      style="width: inherit;"
      on:wheel={scrollHorizontally}
    >
      {#each Array(size) as _}
        <div class="item float-left block aspect-video border border-slate-600 bg-slate-500" />
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .gallery.side > div {
    max-width: calc(var(--maxWidth) * 1px);
  }
  .gallery.side .item {
    width: calc(var(--itemWidth) * 1px);
  }
  .gallery.top .item {
    height: calc((var(--itemWidth) / (16 / 9)) * 1px);
  }
  .gallery > div:not(:hover) {
    &::-webkit-scrollbar-thumb {
      background: transparent !important;
    }
  }
</style>
