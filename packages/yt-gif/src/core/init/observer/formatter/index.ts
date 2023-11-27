import { YTGIF_Config } from '$v3/lib/types/config'
import { mutationTargets } from '$v3/init/observer/formatter/filter'
import { createObserverAndDeployOnIntersection } from '../system/system'

export async function ObserveSpans_DeployUrlButtons(
  targetSelectors: string[],
  appCb: (...args: any) => Function | Promise<any>
) {
  return createObserverAndDeployOnIntersection(targetSelectors, {
    mutationTargets(mutationsList, selectors) {
      return selectors
        .map(sel => mutationTargets(mutationsList, sel))
        .flat()
        .filter(v => YTGIF_Config.guardClause((v as any).href))
    },
    async deploy(payload) {
      console.log('deploying', payload)
      const notionHref = payload.params.target as any
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
      const style = createNotionHrefStyle(containerID)

      // notionHref is a React Node, so it rerenders all the time
      // this is an expensive operation, so we need to memoize it
      await appCb(notionHref.href, notionHref)

      return function onRemoved() {
        style.destroy()
        console.log('destroying app')
      }
    },
  })
}

function createNotionHrefStyle(containerID: any) {
  const styleID = `linklip-follower-portal`
  const style = document.getElementById(styleID) ?? document.createElement('style')
  // style the target to accommodate the portal
  style.innerHTML = `
				[data-block-id="${containerID}"] 
				a.notion-link-token.notion-focusable-token.notion-enable-hover {
					all: unset;

					/* pointer-events: none; */
					/* text-wrap: nowrap; */

					/* height: auto; */
					/* width: 390px; */
					/* aspect-ratio: 16 / 9; */
					
					outline: 1px solid black;
					border-radius: .2em;

					display: block;
					background-image: url("https://dummyimage.com/600x400/000/fff.png&text=10:20");
					background-size:     cover;
					background-position: center center;
				}
			`
  document.head.appendChild(style)
  style.id = styleID
  return {
    destroy() {
      style.innerHTML = ''
    },
  }
}
