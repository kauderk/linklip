import { preSignal } from '$lib/pre-signal'
import { createContext } from '$lib/create-context'
type S = {
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}
export const createDefaultStage = <T = {}>(o?: T) => {
  const signal = preSignal(<S>{ mode: 'free' })
  return Object.assign(signal, o ?? {}) as typeof signal & T
}
const shared = ['notionPage', 'notionTopBar', 'notionMainScroller']
export const stages = () => ({
  sharedControls: createDefaultStage({ shared }),
  activeFollower: createDefaultStage(),
})
export const { getStagesContext, setStagesContext } = createContext({
  stages,
})

export type StageSignal = ReturnType<typeof createDefaultStage<{ shared: string[] }>>
