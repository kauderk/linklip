import { isSpace } from '../../../../lib/helpers'
import type { TRes } from './examine'

export function Format() {
  let url = '', // u -> url
    hidden = '' // h -> hidden content

  return <const>{
    getters: {
      get u() {
        return url
      },
      get h() {
        return hidden
      },
    },
    concatNoCmpt(res: TRes) {
      hidden = hidden.trim()
      const cs = !hidden ? '' : ' '
      const ce = isSpace(res.space) ? '' : cs
      hidden = cs + hidden + ce
    },
    trim(res: TRes) {
      url = res.url
      hidden = res.hidden ?? ''
      hidden = hidden.trim() ? hidden.trim() + ' ' : ''
      return res
    },
  }
}
