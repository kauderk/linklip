import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import { TVideoParams } from '$v3/lib/types/video-types'
import { Wild_Config } from './Wild_Config'
import type { T_YT_RECORD } from './yt-types'

export const recordedIDs = new Map<string, T_YT_RECORD>()
export const allVideoParameters = new Map<string, IExtendedVideoParams>()
export const lastBlockIDParameters = new Map<string, TVideoParams>()
export const UIDtoURLInstancesMapMap = new Map<string, Trm_map>() // since it store recursive maps, once per instance it's enough

export const s_u_f_key = 'simulate_url_formatter'

/* */
export interface ICongif {
  componentPage: string
  targetStringRgx: RegExp
  scatteredMatch: true
}

export class YTGIF_Config {
  static componentPage: TGifTarget = 'yt-gif|video' // this needs to change dynamically
  static readonly targetStringRgx =
    /https\:\/\/(www\.)?(youtu(be.com\/watch|.be\/))?(.*?(?=\s|$|\}|\]|\)))/
  static readonly minimalRgx = /(?<!\S)\/[^:|\s|}|\]|\)]{11,}/
  static readonly guardClause = (url: unknown) =>
    typeof url == 'string' && !!url.match('https://(www.)?youtube|youtu.be')
}
export class URL_Config {
  static readonly componentPage = Wild_Config.componentPage
  static readonly scatteredMatch = true // alright
  static readonly targetStringRgx = YTGIF_Config.targetStringRgx
}

/* ------------------ */
export const videoParams = new TVideoParams()
