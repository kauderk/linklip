<script lang="ts">
  import '$styles/drop-down-menu.scss'
  import { slide } from 'svelte/transition'
  import MenuItem from './MenuItem.svelte'
  import Drops from './Drops.svelte'
  import Swipe from './Swipe.svelte'
  import RoamResearchSearch from '../search/RoamResearchSearch.svelte'

  export let slid = false
  let cords: s

  export let tryRefreshDimensions: () => void

  let transition = true
  const checkTransition = (name: s) => (transition = !!!['Updates', 'Info'].find(j => j == name))
</script>

<!-- prettier-ignore -->
<Drops let:active let:go let:drops let:goToNew>
  <!-- expand vertically -->
  <div
    data-swipe-container
    class="relative"
    transition:slide={{ duration: 300 }}
    on:introstart={() => (slid = false)}
    on:introend={() => (slid = true)}
  >
    <span class="bp3-popover bp3-menu">
      <RoamResearchSearch on:select={e => goToNew(e.detail.original.root)} />
      <!-- switch between percentage and pixel in height -->
      <div class="expandable bg-slate-600 shadow-lg" style={cords} class:transition>
        <!-- swipe left to right: menu items  -->
        {#if active === 'main'}
          {@const _ = checkTransition(active)}
          <Swipe {tryRefreshDimensions} bind:cords {slid} 
						x={-1}>
						{#each drops as { menu, visit, icon = 'play' }}
							<MenuItem go={() => goToNew(menu.name)} {menu} leftIcon={icon}
								{visit} rightIcon='right'
								>{menu.name}</MenuItem>
						{/each}
					</Swipe>
        {/if}
        <!-- swipe right to left: containers -->
        {#each drops as { menu, Sub, type = 'sub-ddm' }}
          {#if active == menu.name}
            {@const _ = checkTransition(active)}
            <Swipe {tryRefreshDimensions} bind:cords {slid}
							clazz="{type}-ddm">
							<div class="m-2 flex items-center justify-center w-full">
								<div class="scale-75 absolute left-0">
									<MenuItem {go} {menu} leftIcon='left'>{""}</MenuItem>
								</div>
								<div class="m-1 rounded bg-gray-700 px-2 py-1 text-lg shadow-md hover:bg-gray-800 hover:text-gray-300">
									<span class="text-color-100 mx-1" >{active}</span>
								</div>
							</div>
							<svelte:component this={Sub} />
						</Swipe>
          {/if}
        {/each}
      </div>
    </span>
  </div>
</Drops>

<style lang="scss">
  .scale-75 :global(div) {
    gap: unset;
  }
  .expandable {
    // :global(.sub-ddm) {
    //   overflow-y: auto;
    //   max-height: 300px;
    // }
    box-sizing: content-box;
    &.transition {
      transition: height 0.2s;
    }

    // top center
    display: flex;
    justify-content: center;
    align-items: flex-start;

    min-width: 280px !important;

    // hide swipes
    position: relative;
    overflow: hidden;

    :global(*) {
      user-select: none;
    }
  }
</style>
