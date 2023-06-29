import { Clone } from '$lib/utils'
import { fmtTimestampsUrlObj } from '$v3/init/formatter/Flow/timestamp'
import { fmtIframe2Url } from '$v3/init/formatter/Flow/url'
import { OnYtGifUrlBtn } from '$v3/init/observer/formatter/update'
import type { CreateParams } from '$v3/init/observer/system/types'
import type { FormatterFunction } from '$v3/init/observer/timestamp/emulation/types'
import { getAnyTmParamType } from '$v3/lib/helpers'
import { createAssignActions, type CreateDropDownActions } from '../../types'
import { urlButton } from '../config'

export const createUrlButtonFormatter = (params: CreateParams) => {
  const model = fmtTimestampsUrlObj()
  const subModel = fmtIframe2Url()
  const copy = Clone(urlButton)

  const formatter = (cb: FormatterFunction) => OnYtGifUrlBtn(params.target, cb)

  const sub = (<const>{
    start: { action: () => formatter(model.startCmpt) },
    end: { action: () => formatter(model.endCmpt) },
    startEnd: { action: () => formatter(model.startEndCmpt) },
    ytgif: { action: () => formatter(model.ytGifCmpt) },
    // prettier-ignore
    swapFormat: !getAnyTmParamType(params.target?.getAttribute('href')) ? undefined : {
      action: () =>
        OnYtGifUrlBtn(params.target, subModel.updUrl, {
          param: 't',
          float: false,
        }),
    },
  }) satisfies { [key in keyof (typeof urlButton)['sub']]: any }

  // @ts-expect-error
  return createAssignActions(copy, sub)
}
