import { mute_style, play_style } from '$v3/components/drop-down-menu/App/player-settings/store'

//#region validate - check values utils

export function CanUnmute() {
  // NotMuteAnyHover
  return !muteIs('soft') && !muteIs('all_muted')
}
//#endregion
//#region play/pause utils

export function muteIs(v: typeof mute_style['value']) {
  return mute_style.value == v
}
export function playIs(v: typeof play_style['value']) {
  const play = play_style
  const is = play.value == v
  return is // && !getOption(play, v).disabled;
}
