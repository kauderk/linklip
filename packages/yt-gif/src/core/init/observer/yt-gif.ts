import { staticPlayerParams } from '$v3/api-ready/types'
import { create_ObserveTarget_DeployComponent } from './system/svelte'
import Ytgif from '$v3/components/yt-gif/player/Ytgif.svelte'
import { CheckFalsePositive } from '$v3/api-ready/setup/query'
import { URLResults } from '$v3/api-ready/setup/url-result'
import { defaultDeployTypes } from '$v3/components/yt-gif/player/actions'

export async function ObserveIframes_DeployTYGifs(targetClass: string[]) {
  return create_ObserveTarget_DeployComponent<Ytgif>(Ytgif, targetClass, {
    async getEntry({ params }) {
      // -------------- Collapse The Player Type --------------------
      // search and get urlIndex and uid
      const res = await URLResults(params.target)

      // don't add up false positives
      if (!res || CheckFalsePositive({ ...res.uidResult, wrapper: params.target })) {
        return
      }

      return {
        props: {
          uidResult: res.uidResult,
          params: staticPlayerParams({
            ...params,
            dataCreation: 'svelte',
          }),
          dirtyParams: {
            grandParentBlock: res.other.grandParentBlock,
          },
          lifeCycle: {
            async onDeploy(e, config) {
              if (e.type == 'customPlayerReady') {
                console.log('customPlayerReady')
                return
              }
            },
            deployType: defaultDeployTypes,
          },
        },
      }
    },
  })
}
export type Awaited_ObserveIframes_DeployTYGifs = Awaited<
  ReturnType<typeof ObserveIframes_DeployTYGifs>
>
