<script lang="ts">
  export let top: s | null = null
  export let left: s | null = null
  export let right: s | null = null
  export let transform = 'rotate(90deg)'
  export let arrowRef: HTMLElement
  //
</script>

<div class="bp3-popover">
  <div class="bp3-popover-arrow" style:left style:right style:top bind:this={arrowRef}>
    <svg viewBox="0 0 30 30" style:transform
      ><path
        class="bp3-popover-arrow-border"
        d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"
      /><path
        class="bp3-popover-arrow-fill"
        d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"
      /></svg
    >
  </div>
</div>

<style lang="scss">
  .bp3-popover {
    -webkit-box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 2px 4px rgba(16, 22, 26, 0.2),
      0 8px 24px rgba(16, 22, 26, 0.2);
    box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 2px 4px rgba(16, 22, 26, 0.2),
      0 8px 24px rgba(16, 22, 26, 0.2);
    -webkit-transform: scale(1);
    transform: scale(1);
    border-radius: 3px;
    display: inline-block;
    z-index: 20;
  }
  .bp3-popover {
    // cover whole screen
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
    pointer-events: none;
  }

  .bp3-popover .bp3-popover-arrow {
    height: 30px;
    position: absolute;
    width: 30px;
  }
</style>
