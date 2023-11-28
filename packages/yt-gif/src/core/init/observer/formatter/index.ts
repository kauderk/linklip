import { YTGIF_Config } from '$v3/lib/types/config'
import { mutationTargets } from '$v3/init/observer/formatter/filter'
import { createObserverAndDeployOnIntersection } from '../system/system'
import { isRendered } from '$lib/utils'

export async function ObserveSpans_DeployUrlButtons(
  targetSelectors: string[],
  appCb: (...args: any) => any
) {
  return createObserverAndDeployOnIntersection(targetSelectors, {
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

        console.log('clicked', e.target.href)
      }

      // notionHref is a React Node, so it rerenders all the time
      // this is an expensive operation, so we need to memoize it
      const app = appCb(notionHref.href, notionHref)

      const unStage = app.stage.subscribe((stage: any) => {
        if (stage.mode == 'host' && isRendered(notionHref)) {
          const maxWidth = notionHref?.closest(`.notranslate`)?.clientWidth || 350
          const width = app.rect.peek().width
          const rect = {
            width,
            maxWidth,
            height: width / (16 / 9),
            maxHeight: maxWidth / (16 / 9),
          }
          createNotionHrefStyle(containerID, rect)
        } else {
          getNotionHrefStyle().innerHTML = ''
        }
      })

      return function onRemoved() {
        unStage()
        if (!document.querySelector(`.notion-text-block[data-block-id="${containerID}"]`)) {
          // notion gave the block a new ID, so we need to destroy the old style
          getNotionHrefStyle().innerHTML = ''
        }
        console.log('destroying app')
      }
    },
  })
}

const styleID = `linklip-follower-portal`
function createNotionHrefStyle(containerID: string, _rect: any) {
  const style = getNotionHrefStyle()

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
	`
  document.head.appendChild(style)
  style.id = styleID
  style.dataset.notionBlockId = containerID
}
function getNotionHrefStyle() {
  return document.getElementById(styleID) ?? document.createElement('style')
}
