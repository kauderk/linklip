<script lang="ts">
  import { dropsStore } from '$v3/components/drop-down-menu/Dropdown/Drops.svelte'
  import RoamResearchSearch from '$v3/components/drop-down-menu/search/RoamResearchSearch.svelte'
  import { DropDownMenuConfig } from '$v3/components/drop-down-menu/svelte-popover/context'

  let modal = false
  function portal(target: HTMLElement) {
    target.hidden = false
    document.body.appendChild(target)
    const content = target.querySelector('.relative') as HTMLElement
    const clickOutside = (e: any) => {
      if (!content.contains(e.target)) {
        modal = false
      }
    }
    ;(document.querySelector('input') as HTMLElement).focus()

    // on:clickOutside
    window.addEventListener('click', clickOutside)
    return {
      destroy: () => {
        target.remove()
        window.removeEventListener('click', clickOutside)
      },
    }
  }
  export let zIndex = 10
</script>

<svelte:window
  on:keydown={e => {
    // alt + k
    if (!modal) {
      if (e.altKey && e.key == 'k') {
        modal = true
      }
    } else {
      if (e.key == 'Escape') {
        modal = false
      }
    }
  }}
/>
{#if modal}
  <div
    use:portal
    hidden
    class="relative"
    aria-labelledby="modal-title"
    role="dialog"
    style:z-index={zIndex}
    aria-modal="true"
  >
    <div class="fixed inset-0 blur-md bg-slate-900 bg-opacity-75 transition-opacity" />

    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full justify-center items-center">
        <div
          class="relative transform rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
        >
          <div class="p-6">
            <RoamResearchSearch
              on:select={e => {
                modal = false
                DropDownMenuConfig.props.update($ => ({ ...$, open: true }))
                dropsStore.set(e.detail.original.root)
              }}
            />
          </div>
          <buttom
            class="absolute inline-flex items-center justify-center text-xs font-bold text-white bg-black border-2 border-white rounded-full dark:border-gray-900 cursor-pointer"
            style="width: 8ch; height: 4ch; top: -2ch; left: -2em;"
            on:mousedown={() => (modal = false)}
          >
            Escape
          </buttom>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .p-6 :global(input) {
    box-sizing: border-box;
  }
</style>
