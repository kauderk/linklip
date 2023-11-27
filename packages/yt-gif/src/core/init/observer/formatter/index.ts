import { createUrlButtonFormatter } from '$v3/components/yt-gif/controls/dropdown/model/url-button/formatters'
import UrlButton from '$v3/components/yt-gif/url-button/UrlButton.svelte'
import { YTGIF_Config } from '$v3/lib/types/config'
import { mutationTargets } from '$v3/init/observer/formatter/filter'
import { create_ObserveTarget_DeployComponent } from '../system/svelte'

export async function ObserveSpans_DeployUrlButtons(targetSelectors: string[]) {
  return create_ObserveTarget_DeployComponent<UrlButton>(UrlButton, targetSelectors, {
    mutationTargets(mutationsList, selectors) {
      return selectors
        .map(sel => mutationTargets(mutationsList, sel))
        .flat()
        .filter(v => YTGIF_Config.guardClause((v as any).href))
    },
    processFoundTargets(targets) {
      return targets.map(target => ({
        target,
        payload: <unknown>{},
      }))
    },
    getEntry: async ({ params }) => ({
      props: {
        sub: createUrlButtonFormatter(params).sub,
      },
    }),
    inject(target, portal) {
      debugger
      const followerPortal = document.createElement('div')
      document.body.appendChild(followerPortal)

      // followerPortal must follow target
      const containerID = target.closest('[data-block-id]').dataset.blockId
      if (!containerID) {
        console.error('containerID not found')
        return
      }
      // create a style tag and append it to the head
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
      if (!style) {
        document.head.appendChild(style)
      }
      style.id = styleID

      followerPortal.insertAdjacentElement('afterbegin', portal)
    },
  })
}
