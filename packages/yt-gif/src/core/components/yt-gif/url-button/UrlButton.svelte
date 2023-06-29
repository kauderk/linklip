<script lang="ts">
  import SubIcon from '../controls/dropdown/Sub.svelte'
  import type { TDropDownActions } from '../controls/dropdown/types'

  export let sub: TDropDownActions['sub']
</script>

<div class="yt-gif-url-btns-wrapper">
  <span class="yt-gif-url-btns vertical yt-gif-max-tooltip">
    {#each Object.values(sub) as data}
      <SubIcon {data} on:click={data.action} />
    {/each}
  </span>
</div>
