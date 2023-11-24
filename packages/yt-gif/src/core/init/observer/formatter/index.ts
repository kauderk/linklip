import { createUrlButtonFormatter } from '$v3/components/yt-gif/controls/dropdown/model/url-button/formatters'
import UrlButton from '$v3/components/yt-gif/url-button/UrlButton.svelte'
import { notionMutationTargets } from '$v3/integration/notion'
import { create_ObserveTarget_DeployComponent } from '../system/svelte'

export async function ObserveSpans_DeployUrlButtons(targetClass: string[]) {
  return create_ObserveTarget_DeployComponent<UrlButton>(UrlButton, targetClass, {
    mutationTargets: notionMutationTargets,
    getEntry: async ({ params }) => ({
      props: {
        sub: createUrlButtonFormatter(params).sub,
      },
    }),
    inject(target, portal) {
      target.insertAdjacentElement('afterbegin', portal)
    },
  })
}
