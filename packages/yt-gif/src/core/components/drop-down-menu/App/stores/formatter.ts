import { createSelectStore } from '$v3/init/config/UIStore/factory/select'
import { createCustomSelectStore } from '$v3/init/config/UIStore/proxy'
import { yt_playback_speed as _yt_playback_speed, options } from '../miscellaneous/props'

export const ms_options = createCustomSelectStore(options, ['multiple', 'custom'])

export const yt_playback_speed = createSelectStore(_yt_playback_speed)
