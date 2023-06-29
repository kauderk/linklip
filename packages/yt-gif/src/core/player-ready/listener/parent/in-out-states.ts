import { isSelected } from '$v3/lib/backend-frontend/option'
import type { TQueryResult } from '../../setup/GetQuery'
import { anyValidInAndOutKey, AnyPlayOnHover } from '../../lib/anyValidInAndOutKey'
import { muteIs, CanUnmute } from '../../lib/IFR'
import { player_settings_options } from '$v3/components/drop-down-menu/App/player-settings/store'

// 3. hover over the frame - mute | pause
export function GetHoverStates(q: TQueryResult) {
  return <const>{
    stop(this: Element, e: MouseEvent) {
      q.wrapper.others.toggleActive()

      q.target.others.StrictFlow()

      q.UpdateLocalVolume()
      q.UpdateHumanInteraction(false)

      if (anyValidInAndOutKey(e) && !muteIs('all_muted')) {
        q.wrapper.toggleActive(true)
        q.videoIsPlayingWithSound()
      } else {
        q.wrapper.toggleActive(false)
        q.togglePlay(!AnyPlayOnHover() && q.isPlaying())
        q.isSoundingFine(false)
      }
    },
    play() {
      if (isSelected(player_settings_options, 'mantain_last_active_player'))
        q.wrapper.others.toggleActive()

      q.target.others.StrictFlow()

      q.UpdateHumanInteraction(true)
      q.togglePlay(true)

      if (CanUnmute()) {
        q.isSoundingFine()
      } else if (muteIs('soft')) {
        q.isSoundingFine(false)
      }
    },
  }
}
