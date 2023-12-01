<script lang="ts">
  import { portal, INJECT } from './portal'
  /**
   * DOM Element or CSS Selector
   */
  export let target: HTMLElement | string = 'body'
  /**
   * @default target.appendChild(portal)
   */
  export let inject = INJECT
</script>

<span use:portal={{ target, inject }} hidden>
  <slot />
</span>
