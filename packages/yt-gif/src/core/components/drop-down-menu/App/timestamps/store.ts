import { createBinaryStore } from '$v3/init/config/UIStore/factory/binary'
import { createSelectStore } from '$v3/init/config/UIStore/factory/select'

import {
  tuts,
  displayTm,
  grabTm,
  LoopOptions,
  loopTimestamps,
  reset,
  restore,
  seekTo,
  seekToActions,
  startEndOptions,
  featuresOptions,
  recoveryOptions,
} from './props'

export const tm_loop_hierarchy = createSelectStore(loopTimestamps)
export const tm_loop_options = createSelectStore(LoopOptions)
export const tm_loop_to = createSelectStore(startEndOptions)
export const tm_options = createSelectStore(featuresOptions)
export const tm_recovery = createBinaryStore(recoveryOptions)
export const tm_reset_on_removal = createSelectStore(reset)
export const tm_restore = createSelectStore(restore)
export const tm_seek_action = createSelectStore(seekToActions)
export const tm_seek_to = createSelectStore(seekTo)
export const tm_workflow_display = createSelectStore(displayTm)
export const tm_workflow_grab = createSelectStore(grabTm)
export const tm_tutorials = createSelectStore({ options: tuts })
