import { tm_seek_action, tm_seek_to } from '$v3/components/drop-down-menu/App/timestamps/store'
import type {
  HTMLClickEventOverride,
  HTMLTimestampClickEventDetail,
} from '$v3/init/observer/timestamp/click/types'
import type {
  FormmatterActionsHTMLElement,
  FormmaterHTMLElement,
} from '$v3/init/observer/timestamp/emulation/types'

export async function ClickOnTimestamp<T extends FormmatterActionsHTMLElement>(
  target: FormmaterHTMLElement,
  override = <HTMLClickEventOverride>{}
) {
  const seekToMessage = tm_seek_to.value == 'soft' ? 'seekTo-soft' : 'seekTo-strict'

  const event: HTMLTimestampClickEventDetail = {
    // cringe event object
    ...(<MouseEvent>{}),
    currentTarget: target,
    which: 1,
    mute: tm_seek_action.value == 'mute',
    simMessage: override.simMessage || '',
    seekToMessage: override.seekToMessage || seekToMessage,
  }
  // how do you resolve/return a promise using a CustomEvent handler?
  await (target as T)?.OnClicks?.(event)
}
