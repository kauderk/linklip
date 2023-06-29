import { paramRgx } from '../../../../lib/utils'

// to url, yt-gif
export function TryToReorderTmParams(url: s) {
  const t = 'start|t' // this is annoying...
  const p = url.includes('t') ? t : 'end'

  const o = p.includes('t') ? 'end' : t
  const wrongOrderRegex = new RegExp(`(${paramRgx(o).source})(.*&)(${paramRgx(p).source})`)

  if (wrongOrderRegex.test(url)) url = url.replace(wrongOrderRegex, '$6$5$1')
  return url
}
