<script lang="ts">
  import SharedControls from './SharedControls.svelte'
  import { onMount } from 'svelte'
  import '../app.css'
  import { cleanSubscribers } from '$lib/stores'
  import { createContextMenu } from '../context-menu/fullscreen'
  import Resize from './Resize.svelte'
  import { player, storyboard } from './timeline/context'
  import Gallery from './gallery/GalleryController.svelte'
  import { stages } from './follower/store'
  import Theater from './gallery/Theater.svelte'

	export let ObserveSpans_DeployUrlButtons = (s: string[]) => Promise.resolve(null as any)
	export let Announcer: any

  onMount(async() => {
    const FirstUpperCase = (str: string) => str[0].toUpperCase() + str.slice(1)
    const context = new Map(
      Object.entries({ player, storyboard, stages }).map(e => [FirstUpperCase(e[0]), e[1]()])
    )
		
		const announcers = (
			await Promise.all([
				ObserveSpans_DeployUrlButtons(['bp3-icon-video']),
			])
		).map(system => {
			if (!system) return () => {}
			const announcer = new Announcer({
				target: document.body,
				props: { system },
			})
			return announcer.$destroy
		})
		

    // document.body.classList.add('debug')
    return cleanSubscribers(
      new SharedControls({
        target: document.body,
        context,
      }).$destroy,
      new Gallery({
        target: document.body,
      }).$destroy,
      new Theater({
        target: document.body,
      }).$destroy,
      ...announcers,
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
