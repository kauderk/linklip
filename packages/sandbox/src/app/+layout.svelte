<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'
  import { cleanSubscribers } from '$lib/stores'
  // @ts-ignore
  import Resize from './Resize.svelte'
  // @ts-ignore
  import Theater from './gallery/Theater.svelte'

  export let ObserveLinks_DeployLinklip = () => Promise.resolve(null as any)

  onMount(async () => {
    const announcers = (await Promise.all([ObserveLinks_DeployLinklip()])).map(observer => {
      if (!observer) return () => {}

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      return () => {
        observer.takeRecords()
        observer.disconnect()
      }
    })

    // document.body.classList.add('debug')
    return cleanSubscribers(
      // new SharedControls({
      //   target: document.body,
      //   context,
      // }).$destroy,
      // new Gallery({
      //   target: document.body,
      // }).$destroy,
      new Theater({
        target: document.body,
      }).$destroy,
      ...announcers,
      new Resize({
        target: document.body,
      }).$destroy,
      // createContextMenu(),
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
    [data-follower*='Gallery'] .grabber {
      display: none;
    }
    .follower-outline {
      outline: 1px solid red;
      opacity: 0.6;
    }
    .notion-help-button {
      display: none !important;
    }
  </style>
</svelte:head>
