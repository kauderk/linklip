<script lang="ts">
  import { tooltipAction } from '../popovers/tooltip'
  import Svg from './SVG.svelte'

  import type { TVisit } from './types'

  export let leftIcon = ''
  export let rightIcon = ''
  export let go: Function
  export let menu: { name: s; 'data-tooltip': s }

  export let visit: TVisit | null = null
  const to = () => {
    go()
    visit?.set(leftIcon && rightIcon ? 'right' : leftIcon ? 'left' : null)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="m-1 cursor-pointer rounded bg-gray-600 px-2 py-1 text-sm shadow-md hover:bg-gray-800 hover:text-gray-300"
  data-visited={visit?.get()}
  on:click|preventDefault={to}
>
  <span data-visit={'left'}>
    <Svg icon={leftIcon} />
  </span>
  <!-- svelte-ignore a11y-missing-attribute -->
  <a class="text-color-100 mx-1" use:tooltipAction={menu}><slot /></a>

  {#if rightIcon}
    <span data-visit={'right'} class="text-color-SA00">
      <Svg icon={'right'} />
    </span>
  {/if}
</div>

<style lang="scss">
  div {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: center;
    transition: background var(--speed);

    &[data-visited*='left'] > [data-visit='left'],
    &[data-visited*='right'] > [data-visit='right'] {
      scale: 1.5;
      filter: brightness(120%);
    }
    :global(svg) {
      width: 1em;
      aspect-ratio: 1;
    }
  }
</style>
