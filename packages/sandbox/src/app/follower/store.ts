import { preSignal } from '$lib/pre-signal'
import { createContext } from '$lib/create-context'
import type { Stage } from '../controller/follower-lib'
export const createDefaultStage = () => preSignal({ mode: 'free' }) as Stage
export const stages = () => ({
  sharedControls: createDefaultStage(),
  activeFollower: createDefaultStage(),
})
export const { getStagesContext, setStagesContext } = createContext({
  stages,
})
