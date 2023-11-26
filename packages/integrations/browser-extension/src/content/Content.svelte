<script lang="ts">
  import Layout from '@packages/sandbox/src/app/+layout.svelte'
  import Menu from '@packages/sandbox/src/app/Menu.svelte'

  import '@packages/yt-gif/src/core/components/styles/index.scss'
  import DropdownMenu, {
    toggleController,
  } from '@packages/yt-gif/src/core/components/drop-down-menu/App/DropDownMenu.svelte'
  import CommandPalette from '@packages/yt-gif/src/core/components/drop-down-menu/Dropdown/CommandPalette.svelte'
  // import { YTApiPromise } from '@packages/yt-gif/src/core/api-ready/gate'

	import { ObserveSpans_DeployUrlButtons } from '@packages/yt-gif/src/core/init/observer/formatter'
	import Announcer from '@packages/yt-gif/src/core/components/announcer/App/Announcer.svelte'


  function load() {
    const url = chrome.runtime.getURL('src/shared/widgetapi.js')
    return import(
      /* @vite-ignore */
      url
    )
  }
</script>

<Menu action={toggleController} />

<CommandPalette zIndex={120} />

<DropdownMenu />

{#await load() then _}
  <Layout {ObserveSpans_DeployUrlButtons} {Announcer}/>
{/await}
