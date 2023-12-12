import { createSvelteSignal } from '$lib/solid'
import { noInvalidate } from '../../../lib/no-invalidate'
import { createInstance, type pair } from './instance'
import { Direction, flipStep } from './helper'
import type { createRangeConfig } from '../ratio/config'
import { Event, createListeners } from '../../../lib/event-life-cycle'
import { cleanAction } from '$lib/stores'
import { createMouseTrack } from '../../controller/mouse-track'
let guard = (e: MouseEvent, index: n) => e.which == 1

type Props = {
  guard: typeof guard
  rangeContext: ReturnType<typeof createRangeConfig>
  calculateValue: (pair: pair, index: number) => { start: number; end: number; handles: string[] }
}
export function createRangeSlider({ guard, rangeContext, calculateValue }: Props) {
  // state management
  const nub = createSvelteSignal({
    active: false,
    pressed: false,
  })
  const range = noInvalidate({
    active: false,
    percentage: 0,
    reminder: Array<{ start: n; end: n; index: n; step?: s }>(),
  })

  // dom references
  let refs = { slider: <HTMLElement>{} }
  const instance = createInstance({ rangeContext })

  const useSlider = (node: HTMLElement) =>
    cleanAction(
      ((refs.slider = node),
      () => {
        refs = { slider: <HTMLElement>{} }
      }), // save one line xd
      instance.state.subscribe($ => {
        node.classList.toggle('disabled', $.disabled)
      }),
      focus.subscribe($ => {
        node.classList.toggle('focus', $)
      }),
      // zoneAction(node,{
      // 	onChange(node, {items,selectedItems}) {
      // 		const indices = !selectedItems.length ? [] : selectedItems.map(sel => items.indexOf(sel))
      // 		rangeIndices._set(indices)
      // 	},
      // })
      createListeners(node, {
        mouseup() {
          nub.mod({ pressed: false })
        },
      })
    )

  const useSliderSet = (node: HTMLElement, index: number) =>
    cleanAction(
      rangeContext.runtimeValues.read[index].subscribe(pair => {
        const { start, end, handles } = calculateValue(pair, index)
        node.style.setProperty('--percentage', start.toString())
        node.style.setProperty('--left', start.toString() + '%')
        node.style.setProperty('--right', (100 - end).toString() + '%')
        node.dataset.handles = handles.toString()
      })
    )

  let focus = createSvelteSignal(false as any)

  function blur() {
    focus.write = false
    nub.write = { active: false, pressed: false }
    range.mod({ active: false })
  }
  function canGoFurther(e: MouseEvent, index: n) {
    const isBad = !instance || instance.state.read.disabled || !guard(e, index)
    if (isBad) {
      return false
    }
    focus.write = true
    return true
  }

  const rangeIndices = noInvalidate([] as n[])

  //export
  function registerHandleEvent(target: HTMLElement, handle: { index: n; step: any }) {
    const mousedown = (e: MouseEvent, _handle?: { step: s }) => {
      const reset = { ...handle, ..._handle }
      const index = reset.index

      if (!canGoFurther(e, index)) {
        return
      }
      instance.state.mod({
        push: 'edges',
      })
      instance.resetHandle(reset)
      const percentage = instance.getHandleValue(e, refs.slider)
      range.mod({
        percentage,
        reminder: instance.getPairs([index]).map(pair => ({
          start: percentage - (pair['start'] || 0),
          end: percentage - (pair['end'] || 0),
          index,
          step: flipStep(reset.step),
        })),
      })
      nub.write = { active: true, pressed: true }
      trackMouseDown(e)
    }

    rangeContext.events[handle.index] = {
      ...rangeContext.events[handle.index],
      blur,
      handle: mousedown,
    }

    // @ts-expect-error
    return Event(target, { mousedown, blur })
  }
  function registerRangeEvent(target: HTMLElement, handle: { index: n }) {
    function mousedown(e: MouseEvent) {
      const index = handle.index
      if (!canGoFurther(e, index)) {
        return
      }
      if (!rangeIndices.read.length) {
        rangeIndices._set([index])
      }
      const _rangeIndices = rangeIndices.read
      instance.resetHandle({
        index: _rangeIndices[_rangeIndices.length - 1],
      })
      instance.state.mod({
        push: _rangeIndices.length ? 'rangeSets' : 'set',
      })
      const percentage = instance.getHandleValue(e, refs.slider)
      range.mod({
        percentage,
        reminder: instance.getPairs(_rangeIndices).map((pair, i) => ({
          start: percentage - (pair['start'] || 0),
          end: percentage - (pair['end'] || 0),
          index: _rangeIndices[i],
        })),
      })
      rangeIndices._set([])
      range.mod({ active: true })
      trackMouseDown(e)
    }

    rangeContext.events[handle.index] = {
      ...rangeContext.events[handle.index],
      blur,
      range: mousedown,
    }

    // @ts-expect-error
    return Event(target, { mousedown, blur })
  }

  const trackMouseDown = createMouseTrack({
    mousemove(e) {
      const n = nub.read
      if (!((n.active && n.pressed) || range.read.active)) {
        return
      }

      const _range = range.read
      const percentage = instance.getHandleValue(e, refs.slider)
      const backwards = _range.percentage > percentage

      if (_range.reminder.length > 1) {
        instance.handle.mod({
          index: backwards
            ? _range.reminder[0].index
            : _range.reminder[_range.reminder.length - 1].index,
        })
      }

      // @ts-expect-error
      const getHandle = (step, index, i) => {
        const pair = instance.tryGetSibling(step, index)
        const current = _range.reminder[i][pair.step]
        const offset = current * Direction(!backwards)
        return {
          ...pair,
          backwards,
          index,
          tick: backwards ? percentage - offset : percentage + offset,
        }
      }

      for (let i = 0; i < _range.reminder.length; i++) {
        const single = _range.reminder[i].step
        const index = _range.reminder[i].index
        const step = single ?? flipStep(backwards)

        const self = getHandle(step, index, i)
        instance.moveHandle(self)

        if (single) {
          continue
        }

        const pair = getHandle(backwards, index, i)
        if (typeof pair.entry == 'number' && pair.step != self.step) {
          instance.moveHandle(pair)
        }
      }
    },
    mouseup: blur,
  })
  return {
    registerRangeEvent,
    registerHandleEvent,
    useSlider,
    useSliderSet,
    focus,
  }
}
