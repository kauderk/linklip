import { createRangeStore } from '$v3/init/config/UIStore/factory/range'
import { createSelectStore } from '$v3/init/config/UIStore/factory/select'

import {
  yt_playback_speed as _yt_playback_speed,
  timestamp_display_scroll_offset as _timestamp_display_scroll_offset,
  end_loop_sound_volume as _end_loop_sound_volume,
  options,
  formatterOptions,
  tuts,
} from './props'

export const yt_playback_speed = createSelectStore(_yt_playback_speed)
export const timestamp_display_scroll_offset = createRangeStore(_timestamp_display_scroll_offset)
export const end_loop_sound_volume = createRangeStore(_end_loop_sound_volume)
export const awaiting_input_type = createSelectStore(options)
export const fmt_options = createSelectStore(formatterOptions)
export const miscellaneous_tutorials = createSelectStore({ options: tuts })
