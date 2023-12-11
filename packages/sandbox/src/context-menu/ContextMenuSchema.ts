import { createSvelteSignal } from '$lib/solid'
import type { ContextMenuSchema } from './types'

const defaultSchema: ContextMenuSchema = {
  nodes: [
    {
      content: 'A Parent Node',
      open: false,
      children: [
        {
          content: 'Send Message to the Console',
          callback: () => console.log('Hello from the Context Menu!'),
        },
      ],
    },
    {
      content: 'Fire an Alert!',
      callback: () => alert('Clicked the Custom Context Menu!'),
    },
  ],
}

export const contextMenuSchema = createSvelteSignal(defaultSchema)
