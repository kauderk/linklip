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
import { createTrackMouseHold } from '@packages/sandbox/src/app/controller/click-track'
import { createRoot } from '@packages/sandbox/src/lib/solid'

export async function ObserveLinks_DeployLinklip() {
  const keyToStateMap = new Map<
    string,
    {
      enabled: boolean
      fetchSaves: () => any
      toggle: () => boolean | undefined
    }
  >()
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

        // followerPortal must follow target
        const containerID = notionHref.closest('.notion-page-content [data-block-id]')?.dataset
          ?.blockId
        if (!containerID) {
          // notion's drag and drop blocks create copies...
          // if this is the case ignore the "ghost" block
          if (!notionHref.closest('.notion-overlay-container')) {
            console.error('containerID not found for:', notionHref)
            return
          }
          // but this doesn't mean you should ignore the operation
          // sometimes this can cause a layout shift, so we need to clean up
          return function onRemoved() {
            cachedDomObserver.tick.notify()
            console.log('cachedDomObserver.tick.notify')
          }
        }

        notionHref.onclick = (e: any) => {
          e.preventDefault() // up the tree
          e.stopPropagation() // disable href (jump to link)
          // console.log('clicked', e.target.href)
        }

        const key = notionHref.href + containerID

        notionHref.onmousedown = createTrackMouseHold({
          hold(e) {
            // TODO: execute the onDestroy from the deploy function
            const enabled = keyToStateMap.get(key)?.toggle()

            console.log('change enabled state', enabled)

            // FIXME: notionHref.remove() // requests host rerender
          },
        })

        const initialState = keyToStateMap.get(key)
        if (initialState?.enabled === false) {
          return
        }

        function fetchSaves() {
          const stringify = localStorage.getItem(key) || '{}'
          return JSON.parse(stringify)
        }

        if (!urlToSvelteMap.has(key)) {
          createRoot(dispose => {
            const saved = fetchSaves()

            const baseConfig = createConfig(saved.baseConfig)

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
            stages.sharedControls.compute((stage: any) => {
              const bottom = ['notionPage', 'notionMainScroller']
              const top = ['notionTopBar']
              const self = baseConfig.stage.read
              if (stage.mode != 'host' || self.mode == 'free') return

              // FIXME: no side effects
              followerUpdate.offset((_, original) => ({
                y: !bottom.includes(stage.selector!) ? 10 : original.y,
              }))
              if ([...bottom, ...top].includes(self.selector!)) {
                follower.trySwitchHost(stage.selector)
              }
            })

            // FIXME: better abstraction, don't pollute the config
            // @ts-expect-error
            baseConfig.constraint = {}
            baseConfig.stage.compute((stage: any) => {
              // @ts-expect-error valueContainer
              const pre = followerConfig.selectors[stage.selector]?.constraint
              const constraint =
                pre && stage.mode != 'free'
                  ? (rect: any) => {
                      return pre(followerUpdate.notionRef().notionHref, rect)
                    }
                  : undefined
              // @ts-expect-error valueContainer
              baseConfig.constraint.constraint = constraint
            })

            // FIXME: most of these closures can cause memory leaks when destroying the component
            // for example the dragThreshold's extra's (contextMenu) schema
            const app = new Linklip({
              target: document.body,
              props: {
                config: baseConfig,
                follower,
                dragThreshold: follower_DragThreshold_ContextMenu(followerConfig, follower, toggle),
                mount: () =>
                  cleanSubscribers(
                    follower.mount(notionHref),
                    baseConfig.resizing.subscribe((resizing: any) => {
                      if (!resizing && baseConfig.stage.read.mode != 'free') {
                        follower.styleHost()
                      }
                    })
                  ),
              },
              context: new Map([
                ['Player', player()],
                ['Storyboard', storyboard()],
                ['Follower', follower],
                stagesCtx,
              ] as any),
            })
            function toggle() {
              const state = keyToStateMap.get(key)
              if (!state) {
                console.error('state not found, calling toggle() before deployment')
                return
              }

              urlToSvelteMap.delete(key) // rerender?
              if (state.enabled) {
                app.$$set?.({}) // attempt to free memory (garbage collection)
                app.$destroy() // it wound't makes sense to destroy an already destroyed component
                const serialized = {
                  baseConfig: baseConfig.serialize(),
                }
                localStorage.setItem(key, JSON.stringify(serialized))
                dispose()
              }

              // one must reference the other, right?
              const enabled = !state.enabled
              keyToStateMap.set(key, {
                ...state!,
                enabled,
              })
              return enabled
            }

            urlToSvelteMap.set(key, {
              update({ notionHref, containerID }) {
                // FIXME: requires cyclic update
                followerUpdate.notionRef = () => ({
                  notionHref,
                  containerID,
                })
                if (baseConfig.stage.read.mode == 'host') {
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

            keyToStateMap.set(key, {
              fetchSaves,
              toggle,
              enabled: true,
            })

            console.log('initial deployment', payload)
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

        console.log('update  deployment', payload)

        return urlToSvelteMap.get(key)!.cleanUp(containerID)
      },
    }
  )
}
