import { GetUrlBtn, GetConfirmBtns } from '../../button/creation'
import { StopPropagations, btnNames, startTm, endTm } from './query'
import { Format } from './Format'
import { SwapToUrlComponentParam } from './examine'
import type { o } from './types'

export function fmtTimestampsUrlObj() {
  return <const>{
    startTm,
    endTm,

    ytGifCmpt(o: o) {
      o.to = ['yt-gif']
      return SwapToUrlComponentParam(o)
    },
    startCmpt(o: o) {
      o.to = ['start']
      return SwapToUrlComponentParam(o)
    },
    endCmpt(o: o) {
      o.to = ['end']
      return SwapToUrlComponentParam(o)
    },
    startEndCmpt(o: o) {
      o.to = ['start', 'end']
      return SwapToUrlComponentParam(o)
    },
    compt2Url(o: o) {
      o.to = ['url']
      return SwapToUrlComponentParam(o)
    },
  }
}
