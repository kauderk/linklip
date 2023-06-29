import { useContextMenu } from './ContextMenu.svelte'
import { createToggleStore } from './toggle'

import type { createRangeConfig } from '../app/timeline/ratio/config'
type Context = ReturnType<typeof createRangeConfig>
import type { PreSignal } from '$lib/pre-signal'

type Props = {
  boundaries: Context['derivedRatios']['boundaries']
  states: Context['states']
  ratioY: PreSignal<number>
  add: Context['add']
  remove: Context['remove']
  progress: PreSignal<{
    preview: number
    scrubbing: boolean
    progress: number
  }>
}
export function createContextMenuCallbacks({
  boundaries,
  states,
  ratioY,
  add,
  remove,
  progress,
}: Props) {
  function boundaryAction(target: HTMLElement, index: n) {
    // avoid component rerender
    return {
      destroy: boundaries[index].subscribe(boundary => {
        target.style.setProperty('--left', `${boundary.startRatio * 100}%`)
        target.style.setProperty('--right', `${100 - boundary.endRatio * 100}%`)
      }),
    }
  }
  function stateAction(target: HTMLElement, index: n) {
    return {
      destroy: states[index].edit.subscribe(state => {
        target.setAttribute('data-state', state)
      }),
    }
  }

  const mutateToggle = createToggleStore(<const>{
    icon: ['send-to', 'eraser'],
    name: ['Add', 'Delete'],
    tooltip: ['Add timestamp', 'Delete Timestamp'],
  })
  const mutateAction = (mutate: b, index?: n) => {
    const props = mutateToggle.tap(mutate)
    return {
      content: props.name,
      callback() {
        if (mutateToggle.peek()) {
          add({ byRatio: progress.peek().preview })
        } else if (typeof index == 'number') {
          remove({ index })
        }
      },
    }
  }
  const sizeToggle = createToggleStore(<const>{
    icon: ['send-to', 'eraser'],
    name: ['Grow', 'Shrink'],
    tooltip: ['Show storyboard', 'Show video Controls'],
  })
  const sizeAction = () => {
    const props = sizeToggle.tap(ratioY.peek() == 0)
    return {
      content: props.name,
      callback() {
        ratioY.set(ratioY.peek() ? 0 : 1)
      },
    }
  }
  type EditId = typeof editSelect[number]['id']

  const editAction = (id: EditId, index: n, target: any) => {
    if (id == 'focus') {
      states.forEach(state => {
        if (state.edit.peek() == id) {
          // @ts-expect-error
          state.edit.set('free')
        }
      })
    }
    // @ts-expect-error
    states[index].edit.set(id)
  }
  const editSelect = <const>[
    {
      content: 'Free',
      tooltip: 'Free Timestamp',
      icon: 'Free',
      id: 'free',
    },
    {
      content: 'Focus',
      tooltip: 'Focus Timestamp',
      icon: 'Focus',
      id: 'focus',
    },
    {
      content: 'Lock',
      tooltip: 'Lock Timestamp',
      icon: 'Lock',
      id: 'lock',
    },
  ]
  const editNodes = (index: n, target: any) => {
    const state = states[index].edit.peek()
    return Object.values(editSelect).map(entry => ({
      ...entry,
      hover: entry.id == state,
      callback() {
        editAction(entry.id, index, target)
      },
    }))
  }

  function processContextMenu(e: MouseEvent, selector: s) {
    // if clicked on a "--index" element, then edit it else mutate it
    const chapter = Array.from(
      // @ts-expect-error
      e.currentTarget?.querySelector(selector)?.childNodes ?? []
      // @ts-expect-error
    ).find(c => c.contains(e.target))
    // @ts-expect-error
    const index = Number(chapter?.style.getPropertyValue('--index'))
    const nodes = isNaN(index)
      ? [sizeAction(), mutateAction(true)]
      : [
          {
            content: 'Edit',
            children: editNodes(index, e.currentTarget),
          },
          sizeAction(),
          mutateAction(false, index),
        ]
    useContextMenu(e, { nodes })
  }

  return {
    boundaryAction,
    processContextMenu,
    stateAction,
  }
}
