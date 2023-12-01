export interface MutationObj<T = unknown> {
  onRemoved?(): void
  processFoundTargets?(targets: HTMLElement[]): Promise<ProcessPayload<T>[]> | ProcessPayload<T>[]
  mutationTargets?(mutationsList: MutationRecord[], targetClass: string[]): HTMLElement[]
}
export type ProcessPayload<T = unknown> = {
  target: HTMLElement
  payload: T
}
export type onRemoved = (target: HTMLElement) => void
export type FuncProcessTarget<ReturnType_, T = unknown> = (params: {
  params: CreateParams
  payload: ProcessPayload<T>
}) => ReturnType_
export type FuncPayload<ReturnType_, T = unknown> = (params: {
  params: CreateParams
  payload: T
}) => ReturnType_

export interface ObserverCallbacks {
  deploy: FuncProcessTarget<Promise<onRemoved | undefined | void>>
  found: { target: HTMLElement; onRemoved: onRemoved }[]
  trackFoundEntry: FuncProcessTarget<Promise<void>>
}
export interface CreateParams {
  target: HTMLElement
  targetClass: string
  message: string
}
