import { GetUrlBtn, GetConfirmBtns } from '../../button/creation'
import { Format } from './Format'
import { btnNames, type Tpage } from './types'
import { ExamineResObj, FilterToUrl } from './filter'
import type { ExtraFormmatter, FormatterObject } from '$v3/init/observer/timestamp/emulation/types'
import { SwapToUrlComponentParam } from '../timestamp/examine'

export function fmtIframe2Url() {
  const { getters: _, trim } = Format()
  return <const>{
    instParam(o: ExtraFormmatter) {
      throw new Error('Not implemented')
    },
    updUrl(o: FormatterObject) {
      o.to = ['url']
      return SwapToUrlComponentParam(o)
    },
  }
}
