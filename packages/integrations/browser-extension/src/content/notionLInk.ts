import { YTGIF_Config } from '@packages/yt-gif/src/core/lib/types/config'
import { mutationTargets } from '@packages/yt-gif/src/core/init/observer/formatter/filter'
import { createObserverAndDeployOnIntersection } from '@packages/yt-gif/src/core/init/observer/system/system'
import Linklip, { createConfig } from '@packages/sandbox/src/app/App.svelte'
import { player, storyboard } from '@packages/sandbox/src/app/timeline/context'
import { stages } from '@packages/sandbox/src/app/follower/store'

export async function ObserveLinks_DeployLinklip() {
  const urlToSvelteMap = new Map<
    string,
    {
      Linklip: Linklip
      config: ReturnType<typeof createConfig>
    }
  >()
  const stageCtx = ['Stages', stages()]

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

        function styleHost() {
          // FIXME: this function is called too often
          // by the Followers's branch function and the stage signal

          const config = urlToSvelteMap.get(key)!.config
          // FIXME: find a new way to abstract this, the styles are changing all over the place
          if (config.stage.peek().mode == 'host' && isRendered(notionHref)) {
            const maxWidth = notionHref.closest('.notranslate')?.clientWidth || 350
            const width = config.rect.peek().width
            const rect = {
              width,
              maxWidth,
              height: width / config.aspectRatio.value,
              maxHeight: maxWidth / config.aspectRatio.value,
            }
            createNotionHrefStyle(containerID, rect)
          } else {
            removeNotionHrefStyle(containerID)
          }
        }
        if (!urlToSvelteMap.has(key)) {
          const context = new Map([
            ['Player', player()],
            ['Storyboard', storyboard()],
            stageCtx,
          ] as any)

          const config = createConfig()

          const app = new Linklip({
            target: document.body,
            props: {
              host: notionHref,
              baseConfig: config,
              styleHost,
            },
            context,
          })

          urlToSvelteMap.set(key, {
            Linklip: app,
            config,
          })
        } else {
          // update
          if (isRendered(notionHref)) {
            urlToSvelteMap.get(key)!.Linklip.$set({ host: notionHref, styleHost })
          } else {
            console.warn('host is not in document')
            return
          }
        }

        // FIXME: run before deploy, so the FollowerPortal can be created acurately
        const unStage = urlToSvelteMap.get(key)!.config.stage.subscribe(styleHost)

        return function onRemoved() {
          unStage()
          if (!document.querySelector(`.notion-text-block[data-block-id="${containerID}"]`)) {
            // notion gave the block a new ID, so we need to destroy the old style
            removeNotionHrefStyle(containerID)
          }
          console.log('destroying')
        }
      },
    }
  )
}
function createNotionHrefStyle(containerID: string, _rect: any) {
  const style = getNotionHrefStyle(containerID)

  if (_rect.height < 50 || _rect.width < 50) {
    console.log('Abort host styling', _rect)
    return
  }
  // style the target to accommodate the portal
  style.innerHTML = `
		[data-block-id="${containerID}"] 
		a.notion-link-token.notion-focusable-token.notion-enable-hover {
			all: unset;

			height: ${_rect.height}px; 
			width: ${_rect.width}px;
			max-width: ${_rect.maxWidth}px;
			max-height: ${_rect.maxHeight}px;

			outline: 1px solid black;
			border-radius: .2em;

			display: block;
		}
	`.trim()
  document.head.appendChild(style)
  style.id = styleID + containerID
}
const styleID = `linklip-follower-portal`
function getNotionHrefStyle(containerID: string) {
  return document.getElementById(styleID + containerID) ?? document.createElement('style')
}
function removeNotionHrefStyle(containerID: string) {
  getNotionHrefStyle(containerID).innerHTML = ''
}
export function isRendered(el?: Element): el is HTMLElement {
  return document.contains(el!)
}