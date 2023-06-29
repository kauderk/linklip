<script lang="ts" context="module">
  import { SvelteComponentTyped } from 'svelte'
  class Fake<T extends Record<string, any>> extends SvelteComponentTyped<T, {}, { default: any }> {}

  export function defineTemplate<T extends Record<string, any>>() {
    return undefined as any as typeof Fake<T> & { Props: T }
  }
</script>

<!-- https://svelte.dev/repl/4531f96e7f8a4d40adfdfd3a4f379893?version=3.12.1 -->
<script lang="ts">
  import Slot from './Slot.svelte'
  //copy our slot content and scope
  let slots = $$props.$$slots
  let scope = $$props.$$scope

  type T = $$Generic

  export let template = class extends Slot {
    constructor(options: typeof Fake<any> & { target: any }) {
      //force instances of this component to use our slot content and scope.
      let new_options = Object.assign({}, options)
      // @ts-ignore
      new_options.props = Object.assign({}, options.props, {
        $$slots: slots,
        $$scope: scope,
      })
      super(new_options)
    }
  } as any as T
  const props = {} as T extends { Props: infer P } ? P : never
</script>

<!-- hack ts -->
{#if $$slots.any}
  <slot name="any" />
  <slot {props} />
{/if}
