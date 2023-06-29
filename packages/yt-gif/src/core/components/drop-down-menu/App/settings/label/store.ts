import { createSelectStore } from '$v3/init/config/UIStore/factory/select'

import { tutOptions as info_tuts } from './info/props'
import { tutOptions as upd_tuts } from './info/props'

export const info_tutorials = createSelectStore({ options: info_tuts })
export const updates_tutorials = createSelectStore({ options: upd_tuts })
