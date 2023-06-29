<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Tutorials from '$v3/components/drop-down-menu/miscellaneous/Tutorials.svelte'

  import SelectLabel from '$v3/components/drop-down-menu/Select/SelectLabel.svelte'
  import Separator from '$v3/components/drop-down-menu/Basic/Separator.svelte'
  import MultipleOptions from '$v3/components/drop-down-menu/Sub/MultipleOptions.svelte'

  import {
    awaiting_input_type,
    iframe_buffer_slider,
    initialize_mode,
    xp_options,
    experience_tutorials,
  } from './store'
  import RangeLabel from '../../Range/RangeLabel.svelte'

  $: selection = ['input_x_buffer']
  $: hidden = selection.includes('disabled')
  $: noInput = selection.includes('input') || hidden
  // prettier-ignore
  $: xp_options.options.try_to_load_when_rendered.hide = noInput || selection.includes('overflow')
</script>

<Tutorials props={experience_tutorials} />

<span>
  <SelectLabel options={initialize_mode} on:option={e => (selection = [e.detail.value])} />
</span>
<Separator />

<!-- start initialize_mode's MultipleOptions -->
<div class:hidden class="mb-2">
  <SelectLabel options={awaiting_input_type} />
</div>
<MultipleOptions props={xp_options} />
{#if !hidden}
  <span class="mt-2" />
  <RangeLabel props={iframe_buffer_slider} />
{/if}
<!-- end initialize_mode's MultipleOptions -->
<span class="mb-2" />

<style>
  span :global(.wrapper) {
    grid-template-columns: 0.5fr 1fr;
  }
</style>
