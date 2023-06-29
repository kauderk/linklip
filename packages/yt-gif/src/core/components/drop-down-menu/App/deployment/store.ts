import { createBinaryStore } from '$v3/init/config/UIStore/factory/binary'
import { createSelectStore } from '$v3/init/config/UIStore/factory/select'
import { createToggleStore } from '$v3/init/config/UIStore/factory/toggle'

import { tuts, featuresOptions, power as _power, deployReset as _deployReset } from './props'
import { settingsTask } from '$v3/settings-page/task'

export const override_roam_video_component = createSelectStore(featuresOptions)
export const deploy_tutorials = createSelectStore({ options: tuts })
export const power = createBinaryStore({
  ..._power,
  updateSubscribers(selected?: b) {
    selected ??= this.value
    if (!selected) deployReset.set(false)

    Object.values(override_roam_video_component.options).forEach(option => {
      // @ts-expect-error
      option.disabled = !selected
    })
    override_roam_video_component.update()
    power.change({ value: selected })
  },
})
export const deployReset = createToggleStore(_deployReset)
settingsTask.promise.then(() => power.updateSubscribers()).catch()
