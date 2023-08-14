<script lang="ts">
  import { tick } from 'svelte'

  let hidden = true

  function branch(target: HTMLElement) {
    // @ts-expect-error
    target.branch = (id, add) => {
      hidden = !add
      console.log(hidden)
      return tick()
    }
  }
</script>

<div class="theater" class:hidden>
  <div class="theater_container notranslate">
    <div class="theater_content" use:branch />
  </div>
</div>

<style>
  .hidden {
    display: none;
    pointer-events: none;
  }
  .theater {
    z-index: 101;
    width: 100%;
    height: 100%;
    background-color: red;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
  }
  .notranslate {
    max-width: 90%;
    max-height: 90%;
    background: blue;
  }
  .theater_container {
    display: flex;
    height: inherit;
    width: inherit;
    justify-content: center;
    align-items: center;
  }
  .theater_content {
    width: 600px;
    aspect-ratio: 16 / 9;
    background-color: #7b7b7b;
  }
</style>
