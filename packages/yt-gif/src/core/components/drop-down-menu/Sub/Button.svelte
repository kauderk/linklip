<script>
  // @ts-nocheck {icon}
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let selected = false
  export let disabled = false
  export let icon = ''

  const onClick = () => dispatch('change', (selected = !selected))
</script>

<button
  type="button"
  class="focus:shadow-outline rounded-md bg-gray-700 px-2 text-sm text-indigo-100 outline-gray-400 outline-2 transition-colors duration-150 hover:bg-cyan-800"
  on:click={onClick}
  on:click
  class:outline={selected}
  {disabled}
>
  <span class="bp3-button-text"><slot /></span>
</button>
