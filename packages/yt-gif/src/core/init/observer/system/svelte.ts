import { createObserverAndDeployOnIntersection } from './system'
import type { FuncPayload, MutationObj } from './types'
import type { SvelteComponentTyped } from 'svelte'
import type { ComponentProps } from 'svelte'
import { get, writable } from 'svelte/store'
import type Portal from '$v3/components/yt-gif/base/Portal.svelte'

export async function create_ObserveTarget_DeployComponent<
  C extends SvelteComponentTyped,
  T = unknown
>(
  component: ConstructorOfATypedSvelteComponent,
  targetClass: string[],
  config: {
    getEntry: FuncPayload<
      Promise<
        | {
            props: ComponentProps<C>
            onRemoved?(): void
          }
        | undefined
      >,
      T
    >
    inject?: ComponentProps<Portal>['inject']
  } & MutationObj<T>
) {
  type TargetProps = Map<
    HTMLElement,
    {
      props: ComponentProps<C>
    }
  >
  let targetEntryMap = writable(new Map() as TargetProps)

  function updateTargetProps(action: (value: TargetProps) => void) {
    const raw = get(targetEntryMap)
    action(raw)
    targetEntryMap.update(o => o)
  }

  const observer = await createObserverAndDeployOnIntersection(targetClass, {
    mutationTargets: config.mutationTargets,
    processFoundTargets: config.processFoundTargets,

    async deploy(data) {
      data.params.target.hidden = true

      // @ts-expect-error
      const entry = await config.getEntry(data).catch()

      if (!entry) {
        data.params.target.hidden = false
        return
      }

      updateTargetProps(map => map.set(data.params.target, entry))

      return function onRemoved() {
        data.params.target.hidden = false
        updateTargetProps(map => map.delete(data.params.target))
        entry.onRemoved?.()
      }
    },
  })
  const inject: ComponentProps<Portal>['inject'] = (target, portal) => {
    target.insertAdjacentElement('afterend', portal)
  }
  return {
    targetEntryMap,
    observer,
    component,
    inject: config.inject ?? inject,
  }
}

export type Awaited_create_ObserveTarget_DeployComponent<T extends SvelteComponentTyped> = Awaited<
  ReturnType<typeof create_ObserveTarget_DeployComponent<T>>
> & {
  component: T
}
