<script lang="ts">
  import { tick } from 'svelte'
  import { fly } from 'svelte/transition'
  import { DropDownMenuConfig } from '../svelte-popover/context'

  export let clazz: StrSearch = undefined
  export let x: 1 | -1 = 1
  export let slid: b
  export let tryRefreshDimensions: () => void

  // 🔥🔥🔥🔥
  let offsetHeight = 0
  let offsetWidth = 0
  const transition = (amount: n) => (amount <= 0 ? '0%' : amount + 'px')
  export let cords = ''
  $: cords = `height: ${transition(offsetHeight)}; width: ${transition(offsetWidth)}`

  // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  let lastTick = offsetWidth
  $: if (lastTick != offsetWidth) {
    lastTick = offsetWidth
    tick().then(tryRefreshDimensions)
  }

  const { props } = DropDownMenuConfig

  const closing = () => ($props.open && slid ? { x: 300 * x, duration: 500 } : { duration: 200 })
</script>

<div
  class={clazz}
  class:absolute={!$props.open || slid}
  bind:offsetHeight
  bind:offsetWidth
  in:fly={closing()}
  out:fly={closing()}
>
  <slot />
</div>
