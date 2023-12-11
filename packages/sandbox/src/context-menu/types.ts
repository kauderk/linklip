import type { SvelteSignal } from '$lib/solid'

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
      open: SvelteSignal<boolean | undefined>
    }
  ) => void
  callback: (openState?: SvelteSignal<boolean>) => void
}
