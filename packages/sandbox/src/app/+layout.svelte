<script lang="ts">
  // import SharedControls from './SharedControls.svelte'
  import { onMount } from 'svelte'
  import '../app.css'
  import App from './App.svelte'
  import { cleanSubscribers } from '$lib/stores'
  import { createContextMenu } from '../context-menu/fullscreen'
  // @ts-ignore
  import Resize from './Resize.svelte'
  import { player, storyboard } from './timeline/context'
  // import Gallery from './gallery/GalleryController.svelte'
  import { stages } from './follower/store'
  // @ts-ignore
  import Theater from './gallery/Theater.svelte'

  export let ObserveSpans_DeployUrlButtons = (s: string[], todoFn: any) =>
    Promise.resolve(null as any)

  onMount(async () => {
    const FirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)
    const context = new Map(
      Object.entries({ player, storyboard, stages }).map(e => [FirstUpperCase(e[0]), e[1]()])
    )

    const urlToSvelteMap = new Map<string, any>()

    function getOrCreateApp(key: string, host: HTMLElement) {
      // @ts-ignore
      let timeout = window.renderAppDelay ?? 50

      if (!urlToSvelteMap.has(key)) {
        const app = new App({
          target: document.body,
          props: {
            host,
          },
          context,
        })
        // set
        if (!timeout) {
          urlToSvelteMap.set(key, app)
        } else {
          setTimeout(() => urlToSvelteMap.set(key, app), timeout)
        }
      } else {
        // update
        if (document.contains(host)) {
          if (!timeout) {
            urlToSvelteMap.get(key).$set({ host })
          } else {
            setTimeout(() => urlToSvelteMap.get(key).$set({ host }), timeout)
          }
        } else {
          console.log('host is not in document')
        }
      }
    }

    const announcers = (
      await Promise.all([
        ObserveSpans_DeployUrlButtons(
          ['a.notion-link-token.notion-focusable-token.notion-enable-hover'],
          getOrCreateApp
        ),
      ])
    ).map(observer => {
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
