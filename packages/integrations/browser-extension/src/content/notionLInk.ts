import { YTGIF_Config } from '@packages/yt-gif/src/core/lib/types/config'
import { mutationTargets } from '@packages/yt-gif/src/core/init/observer/formatter/filter'
import { createObserverAndDeployOnIntersection } from '@packages/yt-gif/src/core/init/observer/system/system'
//@ts-ignore
import Linklip from '@packages/sandbox/src/app/App.svelte'
import { createConfig } from '@packages/sandbox/src/app/integrations/followerCycles'
import { player, storyboard } from '@packages/sandbox/src/app/timeline/context'
import { stages as createStagesCtx } from '@packages/sandbox/src/app/follower/store'
import {
  createCachedDomObserver,
  follower as createFollower,
} from '@packages/sandbox/src/app/controller/follower'
import { follower_DragThreshold_ContextMenu } from '@packages/sandbox/src/app/integrations/follower_DragThreshold_ContextMenu'
import { createSelectorsConfig } from '@packages/sandbox/src/app/integrations/selectorsConfig'
import { cleanSubscribers } from '@packages/sandbox/src/lib/stores'

export async function ObserveLinks_DeployLinklip() {
  const urlToSvelteMap = new Map<
    string,
    {
      update: (params: { notionHref: HTMLElement; containerID: string }) => void
      cleanUp: (containerID: string) => () => void
    }
  >()
  const stagesCtx = ['Stages', createStagesCtx()]
  const cachedDomObserver = createCachedDomObserver()

  return createObserverAndDeployOnIntersection(
    ['a.notion-link-token.notion-focusable-token.notion-enable-hover'],
    {
      mutationTargets(mutationsList, selectors) {
        return selectors
          .map(sel => mutationTargets(mutationsList, sel))
          .flat()
          .filter(v => YTGIF_Config.guardClause((v as any).href))
      },
      async deploy(payload) {
        const notionHref = payload.params.target as any
        if (!document.contains(notionHref)) {
          return
        }
        console.log('deploying', payload)

        // followerPortal must follow target
        const containerID = notionHref.closest('[data-block-id]')?.dataset?.blockId
        if (!containerID) {
          console.error('containerID not found')
          return
        }

        notionHref.onclick = (e: any) => {
          e.preventDefault() // up the tree
          e.stopPropagation() // disable href (jump to link)
          // console.log('clicked', e.target.href)
        }

        const key = notionHref.href + containerID

        if (!urlToSvelteMap.has(key)) {
          const baseConfig = createConfig()

          const { followerConfig, followerUpdate } = createSelectorsConfig({
            aspectRatio: baseConfig.aspectRatio,
            rect: baseConfig.rect,
            stage: baseConfig.stage,
            resizeMode: baseConfig.resizeMode,
            notionRef: () => ({
              notionHref,
              containerID,
            }),
          })
          const follower = createFollower({
            rect: baseConfig.rect,
            stage: baseConfig.stage,
            ...followerConfig,
            cachedDomObserver,
          })

          const stages = stagesCtx[1] as any // the signal types or generics don't work across packages
          const unSharedFollower = stages.sharedControls.subscribe((stage: any) => {
            const bottom = ['notionPage', 'notionMainScroller']
            const top = ['notionTopBar']
            const self = baseConfig.stage.peek()
            if (stage.mode != 'host' || self.mode == 'free') return

            // FIXME: no side effects
            followerUpdate.offset((_, original) => ({
              y: !bottom.includes(stage.selector!) ? 10 : original.y,
            }))
            if ([...bottom, ...top].includes(self.selector!)) {
              follower.trySwitchHost(stage.selector)
            }
          })

          const app = new Linklip({
            target: document.body,
            props: {
              config: baseConfig,
              follower,
              dragThreshold: follower_DragThreshold_ContextMenu(followerConfig, follower, true),
              mount: () => cleanSubscribers(follower.mount(notionHref), unSharedFollower),
            },
            context: new Map([
              ['Player', player()],
              ['Storyboard', storyboard()],
              ['Follower', follower],
              stagesCtx,
            ] as any),
          })

          urlToSvelteMap.set(key, {
            update({ notionHref, containerID }) {
              // FIXME: requires cyclic update
              followerUpdate.notionRef = () => ({
                notionHref,
                containerID,
              })
              if (baseConfig.stage.peek().mode == 'host') {
                follower.changeHost(notionHref)
              }
            },
            cleanUp(containerID) {
              // FIXME: handle other selectors
              const unStage = baseConfig.stage.subscribe(
                followerConfig.selectors.notionLink.styleHost
              )

              return function onRemoved() {
                unStage()
                followerUpdate.notionCleanUp(containerID)
                console.log('destroying')
              }
            },
          })

          // go to cleanUp
        } else {
          if (document.contains(notionHref)) {
            urlToSvelteMap.get(key)!.update({ notionHref, containerID })
          } else {
            console.warn('host is not in document')
            return
          }
        }
        return urlToSvelteMap.get(key)!.cleanUp(containerID)
      },
    }
  )
}
