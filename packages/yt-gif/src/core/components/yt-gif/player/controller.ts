import { getYouTubeVideoID } from '$lib/utils'
import { deleteProperties } from '$lib/utils/object'
import { playerConfig } from '$v3/api-ready/deploy/config'
import type { LifeCycle } from '$v3/api-ready/observer/timestamp-recovery/types'
import type { IInstanceElements } from '$v3/api-ready/setup/formatter/query'
import { CreateConfigParams, CreateRecordID } from '$v3/api-ready/setup/query'
import type { UIDResult } from '$v3/api-ready/setup/url-result'
import { ifBuffer_ShiftOldest } from '$v3/init/observer/performance'
import { TryReloadVideo } from '$v3/lib/event/TryReloadVideo'
import { UIDtoURLInstancesMapMap, allVideoParameters, recordedIDs } from '$v3/lib/types/config'
import { YT_TargetWrapper } from '$v3/lib/types/yt-types'
import { HandleEndState } from '$v3/player-change/HandleEndState'
import { AutoPlayToUpdate, TryFreezeAutoplay } from '$v3/player-ready/finished/autoplay-flow'
import { tryRecycleParameters } from '$v3/player-ready/finished/query'
import { GetHoverStates } from '$v3/player-ready/listener/parent/in-out-states'
import {
  prepareForNextSession,
  tryDestroyYtTarget,
} from '$v3/player-ready/observer/IframeRemmovedFromDom_callback'
import { playPauseIntersectionObserver } from '$v3/player-ready/observer/PauseOffscreen_callback'
import { GetQuery } from '$v3/player-ready/setup/GetQuery'
import { Refurbish } from '$v3/player-ready/setup/Refurbish'
import { assignYtgifMethodsToYTApi } from '$v3/player-ready/setup/SetupRecordID'
import { setupPreviousParams } from '$v3/player-ready/setup/setupPreviousParams'
import { get, writable } from 'svelte/store'
import { defaultDeployTypes, deleteApiCallbacks, type DeployEvent } from './actions'
import { normalizeConfigIfNecessary } from './lib'
import type { Overrides } from './store'
import { createApiStore, getNewPlayerID } from './store'

export const Props = {
  dirtyParams: <Omit<IInstanceElements, 'wrapper'>>{},
  uidResult: <UIDResult>{},
  lifeCycle: <LifeCycle>{
    deployType: defaultDeployTypes,
  },
  overrides: <Overrides>{},
}
export type Props = typeof Props
export function createYtgifController({ dirtyParams, uidResult, lifeCycle, overrides }: Props) {
  const playerID = getNewPlayerID()
  const id = getYouTubeVideoID(uidResult.url)
  const record = CreateRecordID(uidResult.blockID)
  const config = CreateConfigParams(playerID, uidResult.url)
  const store = createApiStore({ playerID, override: overrides?.store })
  let instance = {
    ...dirtyParams,
    wrapper: <HTMLElement | undefined>undefined,
    uid: uidResult.uid,
    url: uidResult.url,
    timeDisplay: <HTMLElement | undefined>undefined,
    // onDeploy
    iframe: <HTMLIFrameElement | undefined>undefined,
  }
  let deployed = writable(false)
  let control: ReturnType<typeof GetQuery> | undefined
  const setControl = () =>
    Object.assign(control!, {
      hover: GetHoverStates(control!),
    })
  let _control = writable<ReturnType<typeof setControl>>()

  // will execute in the following order
  const self = {
    state: { record, config, playerID, id, instance, store },
    derived: { deployed, control: _control },

    async deploy(e: DeployEvent) {
      if (get(deployed) || !lifeCycle?.deployType?.includes(e.type)) return
      await lifeCycle?.onDeploy?.(e, config)
      record.wTarget = new window.YT.Player(playerID, {
        ...playerConfig(config),
        events: {
          onReady: self.onReady,
          onStateChange: self.onStateChange,
        },
      })
    },

    async onReady() {
      if (!record.wTarget || !instance.wrapper) return
      const api = new YT_TargetWrapper(record.wTarget)
      api.getIframe().removeAttribute('title')
      normalizeConfigIfNecessary(api, config)
      // @ts-expect-error instance undefined
      control = GetQuery({ config, instance, api, store })
      _control.set(setControl())
      assignYtgifMethodsToYTApi(record, api, control)
      // @ts-expect-error
      instance.wrapper.ResetBoundaries_smart = self.resetAction
      if (instance.wrapper.hasAttribute('fullfil')) {
        await Refurbish(api, control, config, uidResult)
        tryRecycleParameters(api, config)
        return
      }
      await lifeCycle?.onIgnition?.(instance.wrapper, record.wTarget)
      await record.wTarget.WhileApiBuffering({
        delay: 100,
        tries: 10,
        condition: () =>
          // check if the video isn't buffering
          !record.wTarget!.t?.playerInfo?.videoBytesLoaded || !control!.playerIs('BUFFERING'),
      })
      setupPreviousParams(control, config, uidResult)
      playPauseIntersectionObserver(record.wTarget, control, config)
      // prettier-ignore
      const autoplayIgnition = config.playRightAway?.value && config.hasOwnProperty('updateTime')
				? AutoPlayToUpdate
				: TryFreezeAutoplay
      autoplayIgnition(record.wTarget, control, config)
      tryRecycleParameters(record.wTarget, config)
    },

    async onStateChange() {
      control?.playerWriteState()
      if (control?.playerIs('ENDED') && !record.wTarget?.events.reloading) {
        await HandleEndState({
          Reload: async () =>
            TryReloadVideo({
              t: record.wTarget,
              start: config.start.value ?? 0,
              end: config.end.value ?? 0,
            }),
          // @ts-expect-error
          iframe: record.wTarget?.getIframe(),
          id,
        })
      }
    },

    async resetAction() {
      await TryReloadVideo({
        t: record.wTarget,
        start: config.start.default,
        end: config.end.default,
      })
      control?.seekToUpdatedTime(config.start.default ?? 0)
      return undefined
    },

    async destroy() {
      function cleanSetup() {
        UIDtoURLInstancesMapMap.delete(uidResult.uid)
        recordedIDs.delete(uidResult.entry.mapID)
        if (!get(deployed)) {
          recordedIDs.delete(uidResult.blockID)
          allVideoParameters.delete(playerID)
        }
      }
      async function cleanApi() {
        if (!control) return
        // Update Next Session Values
        await prepareForNextSession(uidResult.entry, store, config, control, record.wTarget!)
        if (store.canBeCleanedByBuffer) {
          ifBuffer_ShiftOldest()
        }
        // either save the target
        tryDestroyYtTarget(store, record.wTarget)
      }
      cleanSetup()
      await cleanApi()
      deleteApiCallbacks(record.wTarget)
      // prettier-ignore
      let dirty = { api: record.wTarget, self, instance, record, config, control, store }
      Object.values(dirty).forEach(deleteProperties)
      deleteProperties(dirty)
      // @ts-expect-error
      dirty = undefined
    },
  }
  return self
}
