import { createSelectStore } from '$v3/init/config/UIStore/factory/select'
import { createRangeStore } from '$v3/init/config/UIStore/factory/range'
import {
  awaiting_input_type as _awaiting_input_type,
  iframe_buffer_slider as _iframe_buffer_slider,
  initialize_mode as _initialize_mode,
  initialize_modeOptions,
  tuts,
} from './props'

export const awaiting_input_type = createSelectStore(_awaiting_input_type)
export const iframe_buffer_slider = createRangeStore(_iframe_buffer_slider)
export const initialize_mode = createSelectStore(_initialize_mode)
export const xp_options = createSelectStore(initialize_modeOptions)
export const experience_tutorials = createSelectStore({ options: tuts })
