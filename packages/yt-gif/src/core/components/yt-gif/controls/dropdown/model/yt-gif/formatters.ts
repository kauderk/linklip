import { Clone } from '$lib/utils'
import {
	type IInstance,
	ytGif_FormatterAction,
} from '$v3/api-ready/setup/formatter/query'
import { fmtTimestampsUrlObj } from '$v3/init/formatter/Flow/timestamp'
import { createAssignActions, type CreateDropDownActions } from '../../types'
import { ytgif } from '../config'

export const createYtgifFormatters: CreateDropDownActions<
	() => IInstance
> = instance => {
	const model = fmtTimestampsUrlObj()
	const copy = Clone(ytgif)

	const sub = (<const>{
		url: {
			action: () => ytGif_FormatterAction(model.compt2Url, instance()),
		},
		startEnd: {
			action: () => ytGif_FormatterAction(model.startEndCmpt, instance()),
		},
		end: { action: () => ytGif_FormatterAction(model.endCmpt, instance()) },
		start: {
			action: () => ytGif_FormatterAction(model.startCmpt, instance()),
		},
	}) satisfies { [key in keyof typeof ytgif['sub']]: any }

	return createAssignActions(copy, sub)
}
