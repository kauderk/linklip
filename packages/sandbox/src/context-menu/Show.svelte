<script lang="ts">
  import type { SvelteSignal } from '$lib/solid'

  type B = b | undefined | null //|((...args: any)=>b)|null|undefined
  export let when: SvelteSignal<B> //|B;
  //
</script>

{#if $when}
  <slot />
{/if}
