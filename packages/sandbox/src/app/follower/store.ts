import { createContext } from '$lib/create-context'
import { createSvelteSignal } from '$lib/solid'

type S = {
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}
export const createDefaultStage = (stage = <S>{ mode: 'free' }) => {
  return createSvelteSignal(stage)
}
const shared = ['notionPage', 'notionTopBar', 'notionMainScroller']
export const stages = () => ({
  sharedControls: Object.assign(createDefaultStage(), { shared }),
  activeFollower: createDefaultStage(),
})
export const { getStagesContext, setStagesContext } = createContext({
  stages,
})
