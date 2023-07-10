<script lang="ts">
  import SharedControls from './SharedControls.svelte'
  import { onMount } from 'svelte'
  import '../app.css'
  import App from './App.svelte'
  import { cleanSubscribers } from '$lib/stores'
  import { createContextMenu } from '../context-menu/fullscreen'
  import Resize from './Resize.svelte'
  import { player, storyboard } from './timeline/context'
  import Gallery from './gallery/GalleryController.svelte'

  onMount(() => {
    const FirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)
    const context = new Map(
      Object.entries({ player, storyboard }).map(e => [FirstUpperCase(e[0]), e[1]()])
    )

    // document.body.classList.add('debug')
    return cleanSubscribers(
      new SharedControls({
        target: document.body,
        context,
      }).$destroy,
      new Gallery({
        target: document.body,
      }).$destroy,
      new App({
        target: document.body,
        props: {
          host: document.querySelector('.notion-scroller main')!,
        },
        context,
      }).$destroy,
      new Resize({
        target: document.body,
      }).$destroy,
      createContextMenu(),
      () => document.body.classList.remove('debug')
    )
  })
</script>

<svelte:head>
  <style>
    body.debug {
      --outline-style: solid;
    }
    [data-mode='host'] {
      outline: 1px var(--outline-style) paleturquoise;
    }
    [style*='--selector'] {
      outline: 1px var(--outline-style) greenyellow;
    }
    .follower-outline {
      outline: 1px solid red;
      opacity: 0.6;
    }
  </style>
</svelte:head>
