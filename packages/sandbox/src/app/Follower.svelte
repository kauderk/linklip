<script lang="ts">
  function centerScroll(target: HTMLElement) {
    target?.scrollTo(
      (target?.scrollWidth - target?.clientWidth) / 2,
      (target?.scrollHeight - target?.clientHeight) / 2
    )
  }
  function portalToBody(target: HTMLElement) {
    document.body.insertBefore(target, document.body.firstChild)
  }
</script>

<div id="foreignApp" use:portalToBody>
  <div class="foreignApp" use:centerScroll>
    {#if window.location.host.includes('localhost')}
      {#each new Array(300) as _}
        <div
          class="random"
          style="left: {Math.floor(Math.random() * 6000)}px; top: {Math.floor(
            Math.random() * 6000
          )}px; width: {Math.floor(Math.random() * 350)}px; height: {Math.floor(
            Math.random() * 500
          )}px"
        />
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  .foreignApp {
    height: 65%;
    aspect-ratio: 1 / 1;
    outline: 1px var(--outline-style) rgb(104, 181, 222);
    position: relative;
    background: rgba(0, 0, 0, 0.45);
    overflow: scroll;
    .random {
      background: linear-gradient(45deg, gray, lightblue);
      position: absolute;
      color: black;
    }
  }
  #foreignApp {
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
</style>
