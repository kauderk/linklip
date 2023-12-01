import { YTGIF_Config } from '$v3/lib/types/config'
import { mutationTargets } from '$v3/init/observer/formatter/filter'
import { createObserverAndDeployOnIntersection } from '../system/system'

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

      return appCb(notionHref)
    },
  })
}
