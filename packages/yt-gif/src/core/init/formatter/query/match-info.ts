import { isSpace, delSubstr } from '../../../lib/helpers'
import { ExtractUrlsObj, ExtractContentFromCmpt } from './extract'

/* ***************** */

export function UrlBtnAction2InfoObj(capture: s, ExtractSubstringObj = ExtractUrlsObj) {
  const content = ExtractContentFromCmpt(capture)

  const matchObj = ExtractSubstringObj(content)

  const start = matchObj?.start! // trust me typescript this will be ok
  const end = matchObj?.end! // trust me typescript this will be ok

  let hidden = matchObj?.match ? delSubstr(content, start, end) : ''

  if (hidden && matchObj?.match)
    if (isSpace(hidden[start - 1]) && isSpace(hidden[start]))
      hidden = delSubstr(hidden, start - 1, start)

  hidden = hidden.trim()

  return {
    hiddenObj: ExtractSubstringObj(hidden),
    matchObj,
    contentObj: {
      match: matchObj?.match,
      hidden,
      content,
    },
  }
}
