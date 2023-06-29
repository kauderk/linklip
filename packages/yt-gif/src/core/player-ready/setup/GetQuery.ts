import { ObjectKeys } from '$lib/utils'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import { PlayerState, YT_TargetWrapper } from '$v3/lib/types/yt-types'
import { writable } from 'svelte/store'
import { PlayIs, SoundIs } from '../lib/PlayIs'
import type { PlayerStoreObj } from '../lib/TStat'
import { GetConfig, GetElementsMethods, GetTarget } from './composition'

export function GetQuery(params: IQueryInput) {
  const { api } = params
  const iframe = api.getIframe()

  return <const>{
    ...GetElementsMethods(params.instance, params.api),
    ...createYouTubeControls(params),

    videoIsPlayingWithSound(boo = true) {
      this.isSoundingFine(boo)
      this.togglePlay(boo)
    },
    togglePlay(bol: b, el = iframe) {
      if (bol) {
        PlayIs('yt-playing', el)
        api.playVideo()
      } else {
        PlayIs('yt-paused', el)
        api.pauseVideo()
      }
    },
    isSoundingFine(bol = true, el = iframe) {
      if (bol) {
        SoundIs('yt-unmute', el)
        api.unMute()
        api.setVolume(params.config.volume.value)
      } else {
        SoundIs('yt-mute', el)
        api.mute()
      }
    },
  }
}

function createYouTubeControls({ config, api }: Pick<IQueryInput, 'config' | 'api' | 'store'>) {
  return {
    ...GetConfig(config),
    ...GetTarget(api),

    UpdateLocalVolume(v?: n) {
      v = v ?? api.getVolume()
      config.volume.value = v
    },
    seekToUpdatedTime(desiredTime: n) {
      config.start.value = desiredTime
      api.seekTo(config.start.value)
    },
    // FIXME: GET ME OUT OF HERE
    seekTo: api.seekTo,
    playerIs(state: keyof typeof PlayerState) {
      return api.getPlayerState() == PlayerState[state]
    },
    playerWriteState() {
      const state = ObjectKeys(PlayerState).find(
        state => PlayerState[state] === api.getPlayerState()
      )
      if (state) {
        this.playerState.set(state)
      }
    },
    playerState: writable<keyof typeof PlayerState>('UNSTARTED'),
  }
}

export interface IQueryInput {
  config: IExtendedVideoParams
  api: YT_TargetWrapper
  store: PlayerStoreObj

  instance: {
    wrapper: HTMLElement
    timeDisplay: HTMLElement
  }
}

export type TQueryResult = ReturnType<typeof GetQuery>
