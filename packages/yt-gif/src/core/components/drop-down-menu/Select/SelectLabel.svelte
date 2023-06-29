<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import type { SelectOptionsProxy } from '$v3/init/config/UIStore/types'
  import type { TLabel } from './Options'
  import Select from './Select.svelte'

  export let options: { label: TLabel } & SelectOptionsProxy
  const _ = options.label
</script>

<div class="ytg-select-label">
  <label for={_.id} use:tooltipAction={_} class="bp3-large">
    <!-- svelte-ignore a11y-missing-attribute -->
    <a role="menuitem" tabindex="0" class="bp3-menu-item bp3-popover-dismiss">
      <div class="bp3-fill bp3-text-overflow-ellipsis">{_.name}</div>
    </a>
  </label>
  <Select props={options} id={_.id} on:option />
</div>

<style lang="scss">
  .ytg-select-label {
    display: grid;
    gap: 1em;
    grid-template-columns: 0.9fr 1fr;
    align-items: center;
    justify-content: center;
    width: 90%;

    label {
      justify-self: end;
      cursor: default;
      margin: 0;
    }
  }
  .ytg-select-label + :global(.ytg-select-label) {
    margin-top: 0.5em;
  }
</style>
