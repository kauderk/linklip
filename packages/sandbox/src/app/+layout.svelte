<script lang="ts">
  import SharedControls from './SharedControls.svelte'
  import { onMount } from 'svelte'
  import '../app.css'
  import App from './App.svelte'
  import { cleanSubscribers } from '$lib/stores'
  import { createContextMenu } from '../context-menu/fullscreen'
  import Resize from './Resize.svelte'
  import { player, storyboard } from './timeline/context'

  onMount(() => {
    const FirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)
    const context = new Map(
      Object.entries({ player, storyboard }).map(e => [FirstUpperCase(e[0]), e[1]()])
    )

    const sharedControls = new SharedControls({
      target: document.body,
      context,
    })
    const app = new App({
      target: document.body,
      props: {
        host: document.querySelector(`[href*="youtu"]>span`)!,
      },
      context,
    })
    const resizeStyles = new Resize({
      target: document.body,
    })
    // document.body.classList.add('debug')
    return cleanSubscribers(
      sharedControls.$destroy,
      app.$destroy,
      resizeStyles.$destroy,
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
  </style>
</svelte:head>
