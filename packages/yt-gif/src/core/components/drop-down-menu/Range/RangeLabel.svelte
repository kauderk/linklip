<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import Range from './Range.svelte'
  import type { TLabel, TRange } from '$v3/components/drop-down-menu/App/miscellaneous/props'
  import type { RangeProxy } from '$v3/init/config/UIStore/types'

  export let props: { label: TLabel } & RangeProxy & { range: TRange }
</script>

<div class="ytg-range-label">
  <span {...props.label} use:tooltipAction={props}>{props.label.name}</span>
  <Range {props} />
</div>

<style lang="scss">
  .ytg-range-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: end;

    width: 97%;
    max-width: 18.5em !important;
    padding: 0px 0.5em;

    span {
      font-size: 0.9em;
      cursor: help;
      text-align: center;
    }
  }
</style>
