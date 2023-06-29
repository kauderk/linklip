import { isRendered } from '$v3/lib/dom/elements-yt-gif-parent'
import { isSelected } from '$v3/lib/backend-frontend/option'
import { playIs } from '../lib/IFR'
import type { TQueryResult } from '$v3/player-ready/setup/GetQuery'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import { player_settings_options } from '$v3/components/drop-down-menu/App/player-settings/store'

//#region 10. pause on off screen
/**
 * 'auto pause' when an iframe goes out the viewport... stop playing and mute
 */
export function playPauseIntersectionObserver(
  //iframe: HTMLIFrameElement,
  t: YT_TargetWrapper,
  q: TQueryResult,

  config: IExtendedVideoParams
) {
  const loadedAndBlurred = () =>
    q.tick() > config.start.value + 1 && !t.ytgif.globalHumanInteraction

  const viewport = new IntersectionObserver(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      if (!entries[0] || !isRendered(entries[0].target)) {
        observer.disconnect()
        return
      }

      if (loadedAndBlurred()) {
        if (!playIs('all_visible')) {
          return stopIfInactive(q)
        }

        if (entries[0].isIntersecting) {
          q.togglePlay(true)
        } else {
          stopIfInactive(q)
        }
      }
    },
    { threshold: [0] }
  )
  viewport.observe(t.getIframe())
}
function stopIfInactive(q: TQueryResult) {
  if (!q.wrapper.isActive() || !isSelected(player_settings_options, 'mantain_last_active_player')) {
    return q.togglePlay(false)
  }
  q.wrapper.others.toggleActive()
  q.target.others.Mute()
  q.target.others.Pause()
}
