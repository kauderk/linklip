<script lang="ts">
  import { generateUidResult } from '$v3/api-ready/setup/url-result'
  import { DropDownMenuConfig } from '$v3/components/drop-down-menu/svelte-popover/context'
  import { properBlockIDSufix } from '$v3/lib/dom/elements-yt-gif-parent'
  import { get } from 'svelte/store'
  import { sharedState } from '../player/store'
  import Ytgif from '../player/Ytgif.svelte'

  export let grandParentBlock = <HTMLElement>{}
  export let url: s

  const { props } = DropDownMenuConfig
</script>

<Ytgif
  uidResult={generateUidResult({
    blockID: grandParentBlock?.id + properBlockIDSufix(url, 0),
    uid: 'irrelevant-uid',
    preUrlIndex: 0,
    accUrlIndex: 0,
    url,
  })}
  overrides={{
    resize: {
      keyCord: 'bottom-center',
      height: sharedState.size.tutorials,
      onSize(size) {
        sharedState.size.tutorials = size
      },
      maxWidth() {
        // plus padding
        return document.body.clientWidth - 20
      },
      onAwkwardResize(resizing) {
        // the entire app will hold if you "set" the store because
        // yt-gif/src/core/components/drop-down-menu/App/DropDownMenu.svelte
        // the {#if $props.open}...{/if} block- guard clauses the the entire hierarchy...
        // this way you just set a less important value
        get(props).anyFocus = resizing
        // by the way the most noticeable effect is that this component
        // "Tutorial.svelte" will be re-rendered with the default height value you put up there
      },
    },
    store: {
      canBeCleanedByBuffer: false,
    },
  }}
  params={{
    targetClass: 'string',
    message: 'yt-gif drop down menu tutorial',
    dataCreation: 'tutorial',
  }}
  dirtyParams={{
    grandParentBlock,
  }}
>
  <span />
</Ytgif>
