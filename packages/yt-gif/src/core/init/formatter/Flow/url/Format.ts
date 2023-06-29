import type { TRes } from './types'

export function Format() {
  let url = '',
    hidden = ''

  return <const>{
    getters: {
      get u() {
        return url
      },
      get h() {
        return hidden
      },
    },
    trim(res: TRes) {
      url = res.url as s
      hidden = res.hidden ?? ''
      hidden = hidden.trim() ? hidden.trim() + ' ' : ''
    },
  }
}
