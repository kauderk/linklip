import { SrrGlobal } from '$lib/global/SrrGlobal'
import { isBlockRef } from '$lib/missing'
import { Clone, div } from '$lib/utils'
import type { UIDResult } from '$v3/api-ready/setup/url-result'
import { isRendered } from '$v3/lib/dom/elements-yt-gif-parent'
import { lastBlockIDParameters, videoParams } from '$v3/lib/types/config'
import type { IExtendedVideoParams, TVideoParams } from '$v3/lib/types/video-types'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import type { PlayerStoreObj } from '$v3/player-ready/lib/TStat'
import { getParent } from '$v3/player-ready/setup/GetElements'
import type { TQueryResult } from '$v3/player-ready/setup/GetQuery'

export function tryDestroyYtTarget(store: PlayerStoreObj, api: YT_TargetWrapper | undefined) {
  const datedIframe = document.querySelector('#' + store.playerID)
  if (datedIframe) {
    console.log(`${store.playerID} is displaced, not removed, thus is not destroyed.`)
  }

  setTimeout(() => {
    if (datedIframe) {
      return
    }

    api?.DestroyTarget()

    // roam research displaces blocks and the YT player api doesn't catch up...
    const TRY = TryToGetPreviousParent(store.playerID)
    if (!TRY) {
      return
    }

    const { previousParent, observerTarget } = TRY
    previousParent.parentNode?.replaceChild(observerTarget, previousParent)
  }, 1000)
}

export async function prepareForNextSession(
  entry: UIDResult['entry'],
  store: PlayerStoreObj,
  config: IExtendedVideoParams,
  control: TQueryResult,
  api: YT_TargetWrapper
) {
  const session = lastBlockIDParameters.get(entry.mapID) ?? videoParams
  const media: TVideoParams = Clone(session)
  media.src.set(entry.mapID_suffix)
  media.id.set(config.id.value)
  media.updateTime.set(control.isBounded(control.tick()) ? control.tick() : config.start.value)
  media.volume.update = api.getVolume() ?? config.volume.update

  if (media.timestamps.history.length == 0) {
    // kinda spaghetti, but it's super necessary - This will not ignore the first block editing - stack change
    media.timestamps.history.push(config.start.value)
  }
  if (media.volume.history.length == 0) {
    media.volume.history.push(config.volume.value)
  }

  // remove useless previous entries
  for (const key of lastBlockIDParameters.keys()) {
    const remove = () => lastBlockIDParameters.delete(key)
    const isYTgif = key?.endsWith(entry.accIndex) && key?.includes(media.id.value)
    const isBlock = key.startsWith(entry.mapID_prefix)

    if (isYTgif && isBlock) {
      remove()
      continue
    }
    if (!isYTgif) {
      continue
    }

    // i'm trying to avoid the await func
    const wasDeletedExternally =
      store.canBeCleanedByBuffer && (await isBlockRef(entry.mapID_prefix.slice(-9)))

    if (wasDeletedExternally) {
      console.log('yt-gif debugger')
      remove()
    }
  }
  // yet add latest params
  if (entry.mapID != null) {
    lastBlockIDParameters.set(entry.mapID, media)
  }
}

function TryToGetPreviousParent(key: string) {
  const previousIframe = document.querySelector('#' + key)!
  if (!isRendered(previousIframe)) {
    return null
  }

  const previousParent = getParent(previousIframe)!
  if (!isRendered(previousParent)) {
    return null
  }

  const observerTarget = div([SrrGlobal.AvoidCircularDependency.getCurrentClassesToObserver()[0]])
  return <const>{ previousParent, observerTarget }
}
