import type { pair } from '../slider/instance'
import { createDiffBoundary, createDiffRatio } from './diff'
import { createRatioBoundary } from './compute'
import { preSignal } from '../../../lib/pre-signal'
import { computed } from '@preact/signals-core'
import { Clone } from '$lib/polyfill'

const createEvents = () => ({
  handle(e: MouseEvent, handle?: { step: s }) {},
  range(e: MouseEvent, handle?: {}) {},
  blur() {},
})
const createState = () => ({
  edit: preSignal<'free' | 'lock' | 'focus'>('free'),
})
export const createRangeConfig = () => {
  const staleValues = preSignal([
    // { start: 0, end: 10 },
    // { start: 20, end: 30 },
    // { start: 30 + 15, end: 40 + 15 },
    // { start: 55, end: 65 },
    { start: 20, end: 80 },
    // { start: 95, end: 100 },
  ])
  const runtimeValues = computed(() =>
    staleValues.value.map(entry => preSignal(Clone(entry) as pair))
  )

  const $values = staleValues.peek()
  const diffBoundaries = $values.map(createDiffBoundary)
  const diffRatios = $values.map(createDiffRatio)
  const boundaries = $values.map(createRatioBoundary)
  const events = $values.map(createEvents)
  const states = $values.map(createState)

  async function change(fn: (previous: pair[]) => void) {
    const previous = runtimeValues.peek().map(signal => signal.peek())
    fn(previous)
    // @ts-expect-error
    staleValues.set([...previous])
  }

  return {
    staleValues,
    runtimeValues,
    events,
    states,
    derivedRatios: <const>{ diffBoundaries, diffRatios, boundaries },

    destroy() {
      ;[diffBoundaries, diffRatios, boundaries, events, states]
        .flat()
        // @ts-expect-error
        .forEach(e => (e = undefined))
    },
    //
    async add(params: { byRatio: n }) {
      async function _add(index = 0) {
        const next = { start: ratio, end: ratio + 5 }
        diffBoundaries.splice(index, 0, createDiffBoundary())
        diffRatios.splice(index, 0, createDiffRatio())
        boundaries.splice(index, 0, createRatioBoundary())
        events.splice(index, 0, createEvents())
        states.splice(index, 0, createState())

        await change($values => $values.splice(index, 0, next))
      }
      const ratio = Math.floor(params.byRatio * 100)

      const $values = runtimeValues.peek()
      for (let i = 0; i < $values.length; i++) {
        const stamp = $values[i]
        if ((stamp.peek().start || 0) > ratio) {
          _add(i)
          return
        }
      }
      _add($values.length)
    },
    remove(params: { index: n }) {
      diffBoundaries.splice(params.index, 1)
      diffRatios.splice(params.index, 1)
      boundaries.splice(params.index, 1)
      events.splice(params.index, 1)
      states.splice(params.index, 1)

      return change($values => $values.splice(params.index, 1))
    },
  }
}
