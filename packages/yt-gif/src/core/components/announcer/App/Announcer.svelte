<script lang="ts">
  import { isRendered } from '$lib/utils'
  import { portal } from '$v3/components/yt-gif/base/portal'
  import type { Awaited_create_ObserveTarget_DeployComponent } from '$v3/init/observer/system/svelte'
  import { onDestroy, onMount } from 'svelte'

  export let system: Awaited_create_ObserveTarget_DeployComponent<any>
  const { targetEntryMap } = system

  onMount(() => {
    system.observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
  onDestroy(() => {
    system.observer.takeRecords()
    system.observer.disconnect()
  })
</script>

{#each Array.from($targetEntryMap.entries()) as [target, entry] (target)}
  <!-- Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node "svelte" -->
  <!-- node_modules\.pnpm\svelte@3.55.0\node_modules\svelte\internal\index.mjs -->
  <!-- check if the document.body contains this target -->
  {#if isRendered(target)}
    <span use:portal={{ target, inject: system.inject }} hidden>
      <svelte:component this={system.component} {...entry.props} />
    </span>
  {/if}
{/each}
