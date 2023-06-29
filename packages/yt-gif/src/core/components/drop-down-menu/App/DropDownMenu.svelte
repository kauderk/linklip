<script lang="ts" context="module">
  const icon = <const>{
    on: 'collection-play-fill',
    off: 'collection-play',
    tooltip: 'YT GIF Extension',
    placement: 'left',
  }
  const { props, control } = DropDownMenuConfig

  export function toggleController(target: HTMLElement) {
    DropDownMenuConfig.wrapperCtx.contentCtx.targetRef = target

    target.addEventListener('click', control.toggle)
    const iconAction = tooltipAction(target, icon)
    const toggleUnsubscribe = props.subscribe(({ open }) => {
      target.style.setProperty('z-index', open ? '100000' : 'unset')
    })
    return {
      destroy() {
        target.removeEventListener('click', control.toggle)
        iconAction.destroy()
        toggleUnsubscribe()
        DropDownMenuConfig.wrapperCtx.contentCtx.targetRef = null
      },
    }
  }
</script>

<script lang="ts">
  import { tooltipAction } from '../popovers/tooltip'
  import DropdownMenu from '$v3/components/drop-down-menu/Dropdown/DropdownMenu.svelte'

  import Content from '../svelte-popover/Content.svelte'
  import { DropDownMenuConfig } from '../svelte-popover/context'
  import { portal } from '$v3/components/yt-gif/base/portal'
  import { themeStore } from './settings/props'

  let overflow: b
  //
</script>

{#if $props.open}
  <span
    hidden
    use:portal={{ target: 'body' }}
    class:bp3-dark={$themeStore == 'dark'}
    class="s-modal"
    class:overflow
  >
    <!-- prettier-ignore -->
    <Content bind:overflow on:clickOutside={control.hideIfBlured} let:tryCalculate>
			<DropdownMenu tryRefreshDimensions={tryCalculate} />
		</Content>
  </span>
{/if}

<style>
  .s-modal.overflow {
    overflow: auto;
    position: fixed;
    z-index: 100000;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    /* backdrop-filter: blur(4px);
		background: rgba(0, 0, 0, 0.705); */
  }
</style>
