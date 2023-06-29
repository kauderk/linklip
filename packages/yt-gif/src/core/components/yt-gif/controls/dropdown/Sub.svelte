<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import type { TDropDown } from './types'
  export let data: TDropDown['sub'][number]
</script>

<span class="yt-gif-url-btn-wrapper yt-gif-max-tooltip" use:tooltipAction={data}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    on:click|stopPropagation|preventDefault
    on:mousedown|stopPropagation|preventDefault
    class="bp3-button bp3-minimal bp3-small dont-focus-block bp3-icon-{data.on}"
    data-yt-gif-url-btn={data.type}
  />
</span>
