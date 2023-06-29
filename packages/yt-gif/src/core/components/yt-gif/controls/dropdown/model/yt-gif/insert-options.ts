import { Clone } from '$lib/utils'
import {
	type IInstance,
	ytGif_InsertAction,
} from '$v3/api-ready/setup/formatter/query'
import { fmtIframe2Url } from '$v3/init/formatter/Flow/url'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import {
	createAssignActions,
	type action,
	type CreateDropDownActions,
} from '../../types'
import { insertOptions } from '../config'

export const createYtgifInsertOptions: CreateDropDownActions<{
	instance: () => IInstance
	reset: action
	t(): YT_TargetWrapper | undefined
}> = ({ t, instance, reset }) => {
	//
	const model = fmtIframe2Url()
	const copy = Clone(insertOptions)

	//
	const tick = () => parseInt(t()?.getCurrentTime()?.toString()!) || 0
	const rate = () => t()?.getPlaybackRate() || 1
	const insert = (fromObj: {}) =>
		ytGif_InsertAction(model.instParam, instance(), fromObj)

	const sub = (<const>{
		start: { action: () => insert({ param: 't', value: tick() }) },
		end: { action: () => insert({ param: 'end', value: tick() }) },
		speed: {
			action: () => insert({ param: 's', value: rate(), float: true }),
		},
		reset,
	}) satisfies { [key in keyof typeof insertOptions['sub']]: any }

	return createAssignActions(copy, sub)
}
