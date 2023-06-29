<script lang="ts">
  import { YTApiPromise } from '$v3/api-ready/gate'
  import DropdownMenu, {
    toggleController,
  } from '$v3/components/drop-down-menu/App/DropDownMenu.svelte'
  import CommandPalette from '$v3/components/drop-down-menu/Dropdown/CommandPalette.svelte'
  import Ytgif from '$v3/components/yt-gif/App/Tutorial.svelte'

  let grandParentBlock: HTMLElement
  let url: string

  function load(target: HTMLElement) {
    YTApiPromise().promise.then(res => {
      grandParentBlock = target
      url = 'https://youtu.be/vKL7vyiQuns'
    })
  }
  //
</script>

<div class="heading m-5 flex justify-center text-2xl font-bold text-gray-100">
  <button class="portal text-center hover:text-cyan-200" use:toggleController>
    <i class="fa-brands fa-youtube" /> YT-GIF
  </button>
</div>

<CommandPalette />

<DropdownMenu />

<div class="holder mx-auto w-10/12 text-gray-200 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
  <!-- each -->
  <div class="each relative m-2 mb-10 bg-gray-800 shadow-lg">
    <div class="container grid place-items-center" use:load>
      {#if url}
        <Ytgif {url} {grandParentBlock} />
      {/if}
    </div>
    <div class="badge absolute right-0 top-0 m-1 rounded bg-blue-800 p-1 px-2 text-xs font-bold">
      10:53
    </div>
    <div class="info-box flex bg-gray-700 p-1 text-xs font-semibold text-gray-300">
      <span class="mr-1 p-1 px-2 font-bold">105 views</span>
      <span class="mr-1 border-l border-gray-400 p-1 px-2 font-bold">105 Likes</span>
      <span class="mr-1 border-l border-gray-400 p-1 px-2 font-bold">105 Comments</span>
    </div>
    <div class="desc p-4">
      <a
        href="https://youtu.be/vKL7vyiQuns"
        target="_new"
        class="title block cursor-pointer font-bold hover:underline">Title</a
      >
      <a
        href="https://youtu.be/vKL7vyiQuns"
        target="_new"
        class="badge cursor-pointer rounded bg-blue-500 px-1 text-xs font-bold text-blue-100"
        >@tag</a
      >
      <span class="description mb-2 block border-gray-400 py-2 text-sm"
        >lorem ipsum bekhum bukhum !lorem ipsum bekhum bukhum !</span
      >
    </div>
  </div>
  <!-- each -->
</div>

<style>
  :global(body) {
    background: gray;
  }
</style>
