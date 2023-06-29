import { recordedIDs } from '$v3/lib/types/config'
import { SoundIs, PlayIs } from '../../lib/PlayIs'
import { muteIs, playIs } from '../../lib/IFR'
import { getBlockID } from '$v3/player-ready/setup/GetElements'
import type { IFR } from '$v3/player-ready/types'

/* ************************************************* */
export function HandleOthers(iframe: IFR) {
  return <const>{
    StrictFlow() {
      if (playIs('strict')) {
        Pause()
      } else if (muteIs('strict')) {
        Mute()
      }
    },
    Mute,
    Pause,
  }
  function Mute() {
    LoopTroughYTGIFs(GetMuteOthersCongif)
  }
  function Pause() {
    LoopTroughYTGIFs(GetPauseOthersCongif)
  }
  function LoopTroughYTGIFs(config = fallback) {
    const frames = document.queryAllasArr(`[${config.styleQuery}]`) as IFR[]

    for (const i of frames) {
      const o = { el: i, id: getBlockID(i) }

      if (i != iframe) {
        config.others_callback(o)
      } //
      else if (config.self_callback) {
        config.self_callback(o)
      }
    }
  }
}
type idEl = {
  id: string
  el: IFR
}
const empty = (_o: idEl) => {
  /* empty */
}
const GetMuteOthersCongif = {
  styleQuery: 'yt-unmute',
  others_callback: (o: idEl) => {
    SoundIs('yt-unmute', o.el)
    recordedIDs.get(o.id)?.wTarget?.mute()
  },
  self_callback: empty,
}
const GetPauseOthersCongif = {
  styleQuery: 'yt-playing',
  others_callback: (o: idEl) => {
    PlayIs('yt-paused', o.el)
    recordedIDs.get(o.id)?.wTarget?.pauseVideo()
  },
  self_callback: empty,
}
const fallback = {
  styleQuery: '',
  others_callback: empty,
  self_callback: empty,
}
