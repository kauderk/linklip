import { convertHMS, HMSToSecondsOnly, seconds2time } from '$lib/utils'
import { tm_workflow_display } from '$v3/components/drop-down-menu/App/timestamps/store'
import type { TimestampFormats } from '$v3/lib/backend-frontend/types'

//DAMN!!!
type sn = string | number
export function fmtTimestamp<T extends number | string = string>(
  value: keyof TimestampFormats = tm_workflow_display.value as keyof TimestampFormats
) {
  const str2sec = (str: sn) => HMSToSecondsOnly(str.toString())
  let fmt = (tms: sn): T => tms.toString() as T

  if (value == 'lessHMS') fmt = (tms: sn): T => seconds2time(str2sec(tms.toString())) as T
  else if (value == 'HMS') fmt = (tms: sn): T => convertHMS(str2sec(tms.toString())) as T
  else if (value == 'hmsSufix')
    fmt = (tms: sn): T => seconds2time(str2sec(tms.toString()), true) as T
  else if (value == 'S' || <T>{}.toString() == 'number')
    fmt = (tms: sn) => str2sec(tms.toString()) as T // I could extract this one, but nah

  return fmt
}
