<script lang="ts">
  import SubBtn from './Button.svelte'
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import { createEventDispatcher } from 'svelte'
  import type { SelectMultipleOptionsProxy } from '$v3/init/config/UIStore/types'
  import type { DetailOption } from '../Select/types'

  export let props: {
    id: s
    attributes: ('single' | 'row' | 'multiple')[]
  } & SelectMultipleOptionsProxy

  const dispatch = createEventDispatcher<{
    option: { selection: s[] } & DetailOption
  }>()

  const update = (value: s, selected: b) => {
    props.change({
      value,
      selected,
    })

    dispatch('option', {
      value,
      selected,
      selection: props.selectedOptions as s[],
    })
  }
  const row = props.attributes.includes('row')
</script>

<div class="ytg-multiple-options" class:vertical={!row} class:horizontal={row}>
  {#each Object.entries($props.options) as [value, option]}
    <span use:tooltipAction={option} class:hidden={option.hide}>
      <SubBtn
        icon={option.icon}
        on:change={e => update(value, e.detail)}
        selected={option.selected}
        disabled={option.disabled}>{option.name}</SubBtn
      >
    </span>
  {/each}
  <slot />
</div>

<!-- prettier-ignore -->
<select class="hidden" multiple={props.attributes.includes('multiple')} id={props.id}>
	{#each Object.entries(props.options) as [value, option]}
		<option {value} {...option} selected={option.selected}>{option.name}</option>
	{/each}
</select>

<style lang="scss">
  .ytg-multiple-options {
    max-width: 18.5em !important;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;

    &.vertical {
      flex-direction: column;
      align-items: center;
    }
    &.horizontal {
      flex-direction: row;
      place-content: center space-evenly;
      justify-content: flex-end;
    }
  }
</style>
