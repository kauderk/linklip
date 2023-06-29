import type { TimestampFormatter } from '$v3/init/observer/timestamp/emulation/types'
import { YTGIF_Config } from '$v3/lib/types/config'
import { TryToReorderTmParams } from './to.url-ytgif'

export type TRes = Awaited<ReturnType<typeof SwapToUrlComponentParam>>
export async function SwapToUrlComponentParam(req: { url: string; to: string[] }) {
  if (!YTGIF_Config.guardClause(req.url)) {
    throw new Error('YT GIF: Invalid URL when formatting components')
  }

  let url = new URL(req.url)
  url.searchParams.set('comp', req.to.join())

  return url.href
}
