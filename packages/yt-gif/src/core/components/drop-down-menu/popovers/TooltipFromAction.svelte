<script lang="ts">
  export let title: s
  export let x: n
  export let y: n
  let clientWidth: n
  //
</script>

<span class="bp3-portal" style:z-index={100000}>
  <div aria-live="polite" class="bp3-overlay bp3-overlay-open bp3-overlay-inline">
    <div
      class="bp3-transition-container bp3-popover-enter-done"
      style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d({x -
        clientWidth / 2}px, {y + 24}px, 0px);"
    >
      <div class="bp3-popover bp3-tooltip" style="transform-origin: 198px top;">
        <div class="relative mx-2" data-name="arrow">
          <svg
            class="absolute left-0 top-full h-2 w-full text-black"
            x="0px"
            y="0px"
            viewBox="0 0 255 255"
            xml:space="preserve"
            ><polygon class="fill-current" points="0,255 127.5,127.5 255,255" /></svg
          >
        </div>
        <div class="relative mx-2">
          <div class="right-0 rounded bg-black px-4 py-1 text-xs text-white" bind:clientWidth>
            {title}
          </div>
        </div>
      </div>
    </div>
  </div>
</span>

<style>
  .bp3-popover-content {
    max-width: 30ch;
  }
  .bp3-transition-container {
    opacity: 1;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    z-index: 20;
  }
  .bp3-popover {
    transform: scale(1);
    border-radius: 3px px;
    display: inline-block;
    z-index: 20;
  }
  .bp3-popover .bp3-popover-content {
    border-radius: 3px;
    position: relative;
  }
</style>
