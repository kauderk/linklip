<script lang="ts" context="module">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  export { menu } from './props'
</script>

<script lang="ts">
  import { theme, toggles } from './props'
  import Button from '../../Sub/Button.svelte'
</script>

<div class="ytg-settings-buttons">
  {#each Object.values({ ...toggles, theme }) as o}
    <span class="flex-align-self-center" use:tooltipAction={o}>
      <Button icon={o.icon} on:click={o.change}>{o.name}</Button>
    </span>
  {/each}
</div>

<style lang="scss">
  .ytg-settings-buttons {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 0.5em;
  }
</style>
