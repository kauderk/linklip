<script lang="ts">
  import Icon from '../BlueprintJS/Icon.svelte'
  import Select from '../Select/Select.svelte'

  import { onMount } from 'svelte'
  import Tutorial from '$v3/components/yt-gif/App/Tutorial.svelte'
  import type { SelectOptionsProxy } from '$v3/init/config/UIStore/types'
  import Separator from '../Basic/Separator.svelte'

  export let props: SelectOptionsProxy
  export let id = 'experience_tut'

  let focus = false
  let wrapper: HTMLSpanElement
  const setFocus = (b: b) => {
    focus = b
    wrapper[b ? 'focus' : 'blur']()
  }

  //#region open - close
  const visible = () => $props.value != 'hide'

  const tryOpen = (open: b) => {
    if (visible() && !open) {
      return // they requested the tutorial, exit
    }
  }
  //#endregion

  onMount(() => tryOpen(visible()))
</script>

<div class="ytg-tutorial">
  <div
    class="mid ytg-tutorial-select"
    on:mouseenter={() => tryOpen(true)}
    on:mouseleave={() => tryOpen(false)}
  >
    <label class="m-0" for={id}><Icon icon="learning" /></label>
    <Select {id} {props} />
  </div>
  {#if $props.value != 'hide'}
    <div
      class="ytg-tutorial-wrapper mt-2.5"
      bind:this={wrapper}
      tabindex="-1"
      on:mouseenter={() => setFocus(true)}
      on:blur={() => setFocus(false)}
      class:ddmFocus={focus}
    >
      <Tutorial url="https://youtu.be/PWT3aHOiKRA" />
    </div>
  {/if}
</div>
<Separator />

<style lang="scss">
  .ytg-tutorial {
    flex-direction: column;
    align-self: center;
    z-index: 4;
    .ytg-tutorial-select {
      @extend .mid;
      align-self: flex-start;
      text-align: center;
      gap: 0.5em;
    }
    .ytg-tutorial-wrapper {
      @extend .mid;
      align-self: center;
      justify-self: center;

      aspect-ratio: 16 / 9;
      border-radius: 10px;
      border: transparent 1px solid;
      outline: 0; // ok...
    }
    .mid {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
