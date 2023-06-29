<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Tutorials from '$v3/components/drop-down-menu/miscellaneous/Tutorials.svelte'
  import SelectLabel from '$v3/components/drop-down-menu/Select/SelectLabel.svelte'
  import Separator from '$v3/components/drop-down-menu/Basic/Separator.svelte'
  import MultipleOptions from '$v3/components/drop-down-menu/Sub/MultipleOptions.svelte'
  import Button from '../../Sub/Button.svelte'

  import {
    tm_tutorials,
    tm_recovery,
    tm_seek_to,
    tm_restore,
    tm_reset_on_removal,
    tm_seek_action,
    tm_loop_hierarchy,
    tm_workflow_display,
    tm_workflow_grab,
    tm_loop_to,
    tm_loop_options,
    tm_options,
  } from './store'
  import { smartBlocksLink } from './props'
  import MainOptional from '../../main/MainOptional.svelte'
</script>

<Tutorials props={tm_tutorials} />

<MainOptional props={tm_recovery} />
<span class:hidden={!$tm_recovery.value} class="flex flex-column items-end flex-col w-full">
  <SelectLabel options={tm_seek_to} />
  <SelectLabel options={tm_restore} />
  <SelectLabel options={tm_reset_on_removal} />
</span>

<Separator />
<SelectLabel options={tm_seek_action} />
<SelectLabel options={tm_loop_hierarchy} />
<span class:hidden={$tm_loop_hierarchy.value == 'disabled'} class="mb-2 mt-2 flex gap-2.5">
  <MultipleOptions props={tm_loop_to} />
  <MultipleOptions props={tm_loop_options} />
</span>

<Separator />
<SelectLabel options={tm_workflow_display} />
<SelectLabel options={tm_workflow_grab} />

<Separator />
<div class="ytg-even-btn">
  <MultipleOptions props={tm_options}>
    <Button on:change={smartBlocksLink.click} icon={smartBlocksLink.on}>Smartblocks</Button>
  </MultipleOptions>
</div>

<style lang="scss">
  .flex-column {
    max-width: 90%;
    :global(.ytg-select-label:last-of-type label) {
      font-size: 0.8em;
    }
  }
  .ytg-even-btn {
    width: 80%;
  }
  .ytg-even-btn :global(.ytg-multiple-options) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
  }
  .ytg-even-btn :global(.ytg-multiple-options span) {
    width: max-content;
  }
  .ytg-even-btn :global(.ytg-multiple-options button) {
    font-size: 1em;
  }
</style>
