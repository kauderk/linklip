import type { PreSignal } from '$lib/pre-signal'

export type ContextMenuSchema = {
  container?: HTMLElement
  nodes: ContextMenuSchemaNode[]
}

type ContextMenuSchemaNode = ContextMenuSchemaParentNode | ContextMenuSchemaActionNode

type ContextMenuSchemaParentNode = {
  content: string
  open?: boolean
  children: ContextMenuSchemaActionNode[]
}

export type ContextMenuSchemaActionNode = {
  content: string
  hover?: boolean
  action?: (
    ref: HTMLButtonElement,
    item: {
      item: ContextMenuSchemaActionNode
      open: PreSignal<boolean | undefined>
    }
  ) => void
  callback: (openState?: PreSignal<boolean>) => void
}
