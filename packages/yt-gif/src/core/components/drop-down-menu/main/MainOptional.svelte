<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import type { BinaryProxy } from '$v3/init/config/UIStore/types'

  export let props: BinaryProxy & {
    id: s
    tooltip: s
    name: s
  }
  //
</script>

<div class="hover-bg select-none" use:tooltipAction={props}>
  <label class="m-2" for={props.id}>{props.name}</label>
  <input
    class="m-2"
    type="checkbox"
    id={props.id}
    tabindex="-1"
    checked={props.value}
    on:change={e => {
      props.change({ value: e.currentTarget.checked })
    }}
  />
</div>

<style lang="scss">
  label {
    color: var(--ddm-100);
    &:active {
      color: var(--ddm-50);
    }
  }
  input[type='checkbox'] {
    opacity: 0.8;
    accent-color: var(--ddm-s-300);
    margin-left: 0.2em;
    margin-right: 0.2em;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    border: 1px solid var(--ddm-700);
    border-radius: 10px;
  }
</style>
