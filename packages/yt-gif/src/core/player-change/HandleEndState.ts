import { currentFullscreenPlayer } from '$v3/init/config/yt-gif-init'
import { isSelected } from '$v3/lib/backend-frontend/option'
import { TryToPlayEndSound, TryToLoadNextTimestampSet, ResetFullscreenPlayer } from './lib'
import { tm_loop_hierarchy } from '$v3/components/drop-down-menu/App/timestamps/store'
import { end_loop_sound_volume } from '$v3/components/drop-down-menu/App/miscellaneous/store'
import { player_settings_options } from '$v3/components/drop-down-menu/App/player-settings/store'

export async function HandleEndState(Args: {
  Reload: () => Promise<void>
  iframe: HTMLIFrameElement
  id: string
}) {
  // Args.iframe
  // 	.closest('.yt-gif-wrapper')
  // 	?.dispatchEvent(new CustomEvent('customVideoEnded'))

  if (tm_loop_hierarchy.value != 'disabled') {
    await TryToLoadNextTimestampSet(Args.iframe, Args.Reload)
  } else {
    await Args.Reload()
  }

  if (end_loop_sound_volume.value.toString() != '0') {
    TryToPlayEndSound().catch()
  }

  if (
    isSelected(player_settings_options, 'minimize_on_video_ended') &&
    currentFullscreenPlayer === Args.id &&
    document.fullscreenElement
  ) {
    ResetFullscreenPlayer()
  }
}
