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
  <div class="theater_container">
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
    background: #000000cf;
    display: block;
    position: fixed;
    top: 0;
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
    background-color: #000;
  }
</style>
