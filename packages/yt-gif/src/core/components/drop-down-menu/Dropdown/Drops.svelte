<script lang="ts" context="module">
  import * as Timestamps from '$v3/components/drop-down-menu/App/timestamps/Timestamps.svelte'
  import * as Observer from '$v3/components/drop-down-menu/App/deployment/Deployment.svelte'
  import * as Experience from '$v3/components/drop-down-menu/App/experience/Experience.svelte'
  import * as PlayerSettings from '$v3/components/drop-down-menu/App/player-settings/PlayerSettings.svelte'
  import * as Miscellaneous from '$v3/components/drop-down-menu/App/miscellaneous/Miscellaneous.svelte'
  import * as Info from '$v3/components/drop-down-menu/App/settings/label/info/Info.svelte'
  import * as Updates from '$v3/components/drop-down-menu/App/settings/label/updates/Updates.svelte'
  import * as Settings from '$v3/components/drop-down-menu/App/settings/Settings.svelte'
  import { visit } from './types'
  import { onMount } from 'svelte'

  import { writable } from 'svelte/store'
  export const dropsStore = writable('')

  const ppt = (o: Object) => ({
    menu: Object.values(o)[0].menu as { name: s; 'data-tooltip': s },
    Sub: Object.values(o)[0].default,
    icon: Object.keys(o)[0],
    type: Object.keys(o)[2] ?? 'sub',
    visit: { ...visit },
  })
  const drops = [
    ppt({ Timestamps }),
    ppt({ Observer }),
    ppt({ Experience }),
    ppt({ PlayerSettings }),
    ppt({ Miscellaneous }),
    ppt({ Updates, footer: '' }),
    ppt({ Info, footer: '' }),
    ppt({ Settings }),
  ]
  const leaveOthers = (name: s) => {
    drops.filter(d => d.menu.name != name).forEach(d => d.visit?.set(null))
    return ''
  }
</script>

<script lang="ts">
  let active = 'main'
  let previous = active

  const go = (to = 'main') => {
    previous = active
    return (active = to)
  }

  const goToNew = (name: s) => {
    leaveOthers(name)
    go(name)
  }
  onMount(() =>
    dropsStore.subscribe(root => {
      if (!root) return
      if (root != active) {
        dropsStore.set('') // huh?
        goToNew(root)
      }
    })
  )
</script>

<slot {active} {previous} {go} {drops} {goToNew} />
