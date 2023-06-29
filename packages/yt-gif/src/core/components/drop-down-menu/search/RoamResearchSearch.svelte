<script lang="ts">
  import { style } from '$lib/svelte/styles'
  import { stack } from './search'
  import Typeahead from './Typeahead.svelte'

  const extract = (item: (typeof stack)[number]) => item.value
  let value = ''
</script>

<Typeahead
  {value}
  data={stack}
  {extract}
  let:resultMap
  let:showResults
  let:closeClickOutside
  let:inputRefAction
  let:selectedIndex
  on:select
>
  <div class="flex items-center" slot="search">
    <div class="relative w-full">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          aria-hidden="true"
          class="h-5 w-5 text-gray-500 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          /></svg
        >
      </div>
      <input
        use:inputRefAction
        bind:value
        autocomplete="off"
        placeholder="Search yt-gif features"
        type="search"
        id="yt-gif-search-input"
        class="block w-full border border-gray-300 bg-gray-50 p-1 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      />
    </div>
  </div>

  <!-- nested slots or Higher Order Components workflows need to be thing-->
  <!-- https://svelte.dev/repl/0820cef07e3d4a41a4bccbb2040493f6?version=3.20.0 -->
  <!-- Element with a slot='...' attribute must be a child of a component or a descendant of a custom element svelte(invalid-slotted-content) -->
  {#if showResults}
    <div
      class="absolute z-50 m-auto overflow-hidden rounded-xl bg-gray-400 p-1 shadow-xl"
      use:closeClickOutside
    >
      {#each resultMap ?? [] as item}
        <li class="flex cursor-pointer items-center rounded-lg p-1 hover:bg-gray-500">
          <div>
            <div class="flex text-base text-black">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <li />
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <span
                class:bg-indigo-200={selectedIndex == item.index}
                class:disabled={item.li.disabled}
                on:click={item.click}
                on:mouseenter={item.mouseenter}
                class="rm-search-title bp3-text-overflow-ellipsis rounded-md px-2"
                >{@html item.result.string}</span
              >
            </div>
          </div>
        </li>
      {/each}
    </div>
  {/if}
</Typeahead>

<style>
  .disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
