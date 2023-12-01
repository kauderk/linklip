import { createListeners } from '$lib/event-life-cycle'
import { cleanSubscribers } from '$lib/stores'
import { useContextMenu } from 'src/context-menu/ContextMenu.svelte'
import { createTrackMouseHold } from '../controller/click-track'
import { camelCaseToTitleCase } from '../controller/follower-lib'
import type { createSelectorsConfig } from './selectorsConfig'
import type { follower as createFollower } from '../controller/follower'

export function follower_DragThreshold_ContextMenu(
  followerConfig: ReturnType<typeof createSelectorsConfig>['followerConfig'],
  follower: ReturnType<typeof createFollower>,
  pictureInPicture = false
) {
  const sharedStages = Object.keys(followerConfig.selectors)
  // FIXME: abstract stageSignal
  // .map(val => val.stageSignal?.shared ?? [])
  // .flat()
  const contextMenuSelectorNodes = Object.entries(followerConfig.selectors)
    .map(([key, value]) => {
      if (sharedStages.includes(key)) return
      return {
        content: camelCaseToTitleCase(key),
        async callback() {
          await follower.innerApi.preBranch(key)
          const newHost = follower.innerApi.resolveSelector(value.selector.target)
          if (!newHost) return
          follower.innerApi.branchOutHost(newHost)
        },
        action(ref: HTMLElement) {
          const hover = (toggle: boolean) => () =>
            follower.innerApi
              .resolveSelector(value.selector.target)
              ?.classList.toggle('follower-outline', toggle)

          return {
            destroy: cleanSubscribers(
              createListeners(ref, {
                mouseenter: hover(true),
                mouseleave: hover(false),
              }),
              hover(false)
            ),
          }
        },
      }
    })
    .filter(Boolean)
  if (pictureInPicture) {
    contextMenuSelectorNodes.unshift(<any>{
      content: 'Picture In Picture',
      callback: follower.innerApi.branch,
    })
  }

  return createTrackMouseHold({
    threshold: follower.innerApi.trackPointer,
    hold(e) {
      // @ts-expect-error
      useContextMenu(e, { nodes: contextMenuSelectorNodes }, true)
    },
  })
}
