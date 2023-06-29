import { ytGifAttr } from '$v3/init/config/paths'
import { ObjectKeys } from '$lib/utils'

//#region play/mute attr styles utils
type TMute = 'yt-mute' | 'yt-unmute'
type TPlay = 'yt-playing' | 'yt-paused'
export function SoundIs(style: TMute, el: El) {
  StyleAttribute(ytGifAttr.sound, style, el)
}
export function PlayIs(style: TPlay, el: El) {
  StyleAttribute(ytGifAttr.play, style, el)
}
function StyleAttribute(subStyle: {}, style: s, el: El) {
  ObjectKeys(subStyle).forEach(k => el.removeAttribute(subStyle[k]))
  el.setAttribute(style, '')
}
