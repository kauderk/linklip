import { YTGIF_Config } from '../../../lib/types/config'

export function getYTUrlObj(rm_btn: El) {
  const ytUrlEl = rm_btn as HTMLLinkElement

  let url = ytUrlEl?.href

  if (!YTGIF_Config.guardClause(url)) url = ''

  return <const>{ url, ytUrlEl }
}
