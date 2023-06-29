import { createSelectStore } from '$v3/init/config/UIStore/factory/select'
import {
  play_style as _play_style,
  mute_style as _mute_style,
  fullscreen_style as _fullscreen_style,
  url_boundaries as _url_boundaries,
  url_volume as _url_volume,
  tuts,
  options,
} from './props'

export const play_style = createSelectStore(_play_style)
export const mute_style = createSelectStore(_mute_style)
export const fullscreen_style = createSelectStore(_fullscreen_style)
export const url_boundaries = createSelectStore(_url_boundaries)
export const url_volume = createSelectStore(_url_volume)
export const player_settings_options = createSelectStore(options)
export const player_settings_tutorials = createSelectStore({ options: tuts })
