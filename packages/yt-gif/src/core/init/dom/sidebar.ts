import { openBlockInSidebar, setSideBarState } from '$lib/missing'
import { innerElsContains, sleep } from '$lib/utils'
import { TARGET_PAGE, TARGET_UID } from '$v3/settings-page/keys'

const anySidebarInstance = () => Bars().length >= 1

export async function toggleRoamResearchSidebar_YtGifSettingsPage(props: { onOpen: Function }) {
  if (!anySidebarInstance()) {
    await setSideBarState(3) // open
    await sleep(50) // an observer is the safest option though
    props.onOpen()
    await openBlockInSidebar(TARGET_UID) // backend execution... should it be here...? //https://stackoverflow.com/questions/12097381/communication-between-scripts-three-methods#:~:text=All%20JS%20scripts%20are%20run%20in%20the%20global%20scope.%20When%20the%20files%20are%20downloaded%20to%20the%20client%2C%20they%20are%20parsed%20in%20the%20global%20scope
    // fires settings page instance
    await sleep(50)
    Bars()?.[0]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  } else {
    await setSideBarState(4) // close
    await sleep(50) // an observer is the safest option though
  }
}

function Bars() {
  return innerElsContains('.rm-sidebar-outline .rm-title-display span', TARGET_PAGE)
}
