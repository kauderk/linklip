<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import type { SelectOptionsProxy } from '$v3/init/config/UIStore/types'
  import { getSelectOption } from '$v3/lib/backend-frontend/option'
  import { createEventDispatcher } from 'svelte'
  import type { DetailOption } from './types'

  export let id: s
  export let props: SelectOptionsProxy

  const dispatch = createEventDispatcher<{ option: DetailOption }>()
</script>

<div class="relative inline-flex self-center" use:tooltipAction={props.options[props.value]}>
  <select
    {id}
    on:change={e => {
      const option = getSelectOption(e.currentTarget)
      const payload = {
        value: option.value,
        selected: option.selected,
        disabled: option.disabled,
      }
      props.change(payload)
      dispatch('option', payload)
    }}
    class="text-white-600 h-6 w-full appearance-none rounded border-2 border-gray-700 bg-gray-500 pl-5 pr-10 text-sm font-bold hover:border-gray-400 focus:outline-none"
  >
    {#each Object.entries(props.options) as [value, option]}
      <option {value} {...option} title={option['data-tooltip']}>{option.name}</option>
    {/each}
  </select>
  <span class="pointer-events-none absolute right-0 top-0 rounded bg-gray-700 px-1">
    <i class="fa-solid fa-angle-down" />
  </span>
</div>

<style>
  select:hover + span {
    opacity: 0.5;
  }
</style>
