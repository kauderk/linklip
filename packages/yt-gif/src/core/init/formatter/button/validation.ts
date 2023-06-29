import { isTrue } from '$lib/utils'
import { s_u_f_key } from '../../../lib/types/config'

/* ***************** */

export function ValidUrlBtnUsage() {
  const key = s_u_f_key

  const binarySessionVal = (k: s) =>
    isTrue(
      window.YT_GIF_DIRECT_SETTINGS?.get(
        'ms_options'
        // @ts-ignore
      )?.sessionValue?.includes?.(k)
    )

  const usageKey = binarySessionVal('override_' + key) || isTrue(localStorage.getItem(key) as s)

  return usageKey && binarySessionVal(key)
}
