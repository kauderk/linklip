<script lang="ts">
  import Svg from './SVG.svelte'

  export let action = (target: HTMLElement) => {}
  function portal(target: HTMLElement) {
    const sibling = document.querySelector(
      '.notion-topbar-action-buttons .notion-topbar-share-menu'
    )!
    sibling.insertAdjacentElement('afterend', target)
    target.hidden = false
    return action(target)
  }
</script>

<div style="position: relative;" hidden use:portal>
  <div
    aria-label="YT Gif Menu"
    role="button"
    tabindex="0"
    class="ytg-menu"
    style="user-select: none; transition: background 20ms ease-in 0s; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 3px; width: 24px; aspect-ratio: 1 / 1; margin-right: 2px; margin-top: 1px;"
  >
    <Svg icon="logo-idle" />
  </div>
</div>
