<script lang="ts">
  import type { PreSignal } from '$lib/pre-signal'

  type B = b | undefined | null //|((...args: any)=>b)|null|undefined
  export let when: PreSignal<B> //|B;
  //
</script>

{#if $when}
  <slot />
{/if}
