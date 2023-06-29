import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import type { LastActiveTimestamp } from '../../../emulation/types'

type MapValue<K extends keyof IExtendedVideoParams> = {
  [key in K]: IExtendedVideoParams[K]['value']
}

type TExchange = 'start' | 'end' | 'updateTime' | 'mute' | 'playRightAway'

export interface ICustomPlayerReady extends MapValue<TExchange> {
  page: startEnd
  obsTimestamp: LastActiveTimestamp['lastActiveTimestamp']
}
