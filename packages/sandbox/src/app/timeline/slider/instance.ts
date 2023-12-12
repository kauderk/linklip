type EntryValue = n
type ENTRY = { value: n }

export type pair = {
  start?: EntryValue
  end?: EntryValue
}
type handle = { index: n; step: startEnd }
type DeepReadonly<T> = T

import { Backwards, Direction, flipStep, mapRange, objectMap } from './helper'

import { Clone } from '$lib/polyfill'
import { createSvelteMemo, createSvelteSignal } from '$lib/solid'
import type { createRangeConfig } from '../ratio/config'

type Props = {
  rangeContext: ReturnType<typeof createRangeConfig>
}

export function createInstance({ rangeContext }: Props) {
  type b = boolean
  type n = number
  type s = string
  type o = object
  type startEnd = 'start' | 'end'

  const { staleValues, runtimeValues, states } = rangeContext

  const handle = createSvelteSignal(<DeepReadonly<handle>>{
    index: 0,
    step: staleValues.peek()[0]?.start ? 'start' : 'end',
  })
  const settings = createSvelteSignal(<const>{
    min: 0,
    max: 100,
    pipStep: 1,
    precision: 2,
  })
  const rect = createSvelteSignal(<const>{ gap: 0, min: 5 }) // why 10?
  const state = createSvelteSignal(<const>{
    range: true as b | 'min' | 'max',
    push: 'set' as 'edges' | 'set' | 'rangeSets',
    disabled: false,
  })

  const look = createSvelteMemo(() => ({
    startLookup: walkValuesLimit([...staleValues.read], 'start'),
    endLookup: walkValuesLimit([...staleValues.read].reverse(), 'end')
      .map((pair, i, arr) => {
        Object.entries(pair).forEach(
          ([key, value]) =>
            // @ts-expect-error F
            (pair[key] = mapRange(value, 0, 100, 100, 0))
        )
        if (i == arr.length - 1) {
          // why is this misaligned?
          pair.start = (pair.end || 0) - rect.peek().min
        }
        return pair
      })
      .reverse(),
    previousValues: Clone(staleValues.read),
  }))

  let startValue = staleValues.peek()[handle.peek().index][handle.peek().step]!
  let previousValue = startValue
  let pending = false

  /**
   * MAIN LOGIC
   * Based on a "tick" percentage. Look in the next step's direction to:
   * Stop or Push them
   */
  function moveHandle(params: Pair & DeltaDirection) {
    if (pending) return
    pending = true
    let tick = params.tick

    threshold({
      ...params,
      with(entry) {
        const edge = state.peek().push ? entry.tick + entry.offset : entry.value - entry.offset

        if (state.peek().push) {
          // invalidate svelte variable
          // @err
          runtimeValues.peek()[entry.index].mod({
            [entry.step]: getEdgeValue({
              index: entry.index,
              step: entry.step,
              backwards: params.backwards,
              value: edge,
            }),
          })

          return edge
        } else {
          tick = edge
          return true
        }
      },
    })

    const entry = getEntryBy(params)!
    // if the value has changed, update it
    if (entry !== tick) {
      tick = getEdgeValue({
        ...params,
        value: tick,
      })
      // invalidate svelte variable
      // @err
      runtimeValues.peek()[params.index].mod({
        [params.step]: tick,
      })
    }

    // fire the change event when the handle moves,
    // and store the previous value for the next time
    if (previousValue !== tick) {
      //eChange()
      previousValue = tick
    }
    pending = false
  }

  //#region event handler
  function handleInteractEvent(clientPos: PosEvent, target: HTMLElement) {
    return handleInteract(getHandleValue(normalisedClient(clientPos), target))
  }
  function handleInteract(tick: n) {
    const params = {
      ...handle.peek(),

      tick,
      backwards: false,
    }
    params.backwards = startValue > params.tick

    const paramLink = state.peek().push == 'edges' ? getNextLink(params) : undefined
    if (paramLink?.hit) {
      // @ts-expect-error
      $state.disabled = true
      pending = false

      handle.mod({
        index: paramLink.index,
        step: paramLink.step,
      })

      moveHandle({
        tick: resetTick(getEntryBy(paramLink)!),
        backwards: paramLink.backwards,
        ...handle.peek(),
      })

      // @ts-expect-error
      $state.disabled = false
      return
    }

    // move handle to the value
    moveHandle(params)
  }
  //#endregion

  //#region get percentage
  function alignValueToStep(val: n) {
    const { min, max, pipStep, precision } = settings.peek()
    const fixFloat = (v: n) => parseFloat(v.toFixed(precision))
    // sanity check for performance
    if (val <= min) {
      return fixFloat(min)
    } else if (val >= max) {
      return fixFloat(max)
    }
    // find the middle-point between steps
    // and see if the value is closer to the
    // next step, or previous step
    let remainder = (val - min) % pipStep
    let aligned = val - remainder
    if (Math.abs(remainder) * 2 >= pipStep) {
      aligned += remainder > 0 ? pipStep : -pipStep
    }
    // make sure the value is within acceptable limits
    const clampValue = (val: n) => (val <= min ? min : val >= max ? max : val)
    aligned = clampValue(aligned)
    // make sure the returned value is set to the precision desired
    // this is also because javascript often returns weird floats
    // when dealing with odd numbers and percentages
    return fixFloat(aligned)
  }
  function getHandleValue(clientPos: PosEvent, target: HTMLElement) {
    const dims = target.getBoundingClientRect()
    const handlePos = clientPos.clientX - dims.left
    const handlePercent = (handlePos / dims.width) * 100
    const { max, min } = settings.peek()
    return ((max - min) / 100) * handlePercent + min
  }
  //#endregion

  //#region getters
  function getEntry(): Readonly<EntryValue> {
    return getPair()[handle.peek().step]!
  }
  function getEntryBy(entry: { step: startEnd; index: number }): Readonly<EntryValue | undefined> {
    return runtimeValues.peek()[entry.index].peek()[entry.step]
  }
  function getEntryValue(pair = runtimeValues) {
    return pair.peek()[handle.peek().index].peek()[handle.peek().step]!
  }
  function getLimit(step: startEnd) {
    const { startLookup, endLookup } = look.peek()
    const limit = step == 'start' ? startLookup : endLookup
    // @ts-expect-error
    return getEntryValue(limit)
  }
  function getEntryStep(step: s): Readonly<EntryValue | undefined> {
    return getPair()[step as startEnd] // well
  }
  function getPair(): Readonly<pair> {
    return runtimeValues.peek()[handle.peek().index].peek()
  }
  function getPairs(slice: n[]): Readonly<pair[]> {
    return slice.map(i => runtimeValues.peek()[i].peek())
  }
  function getPreviousOffset(index: n, step: startEnd) {
    const previous = look.peek().previousValues[index]
    return (
      // prettier-ignore
      previous[step]! - previous[flipStep(step)]! || 0
    )
  }
  let stopIndices = states.map((state, index) => {
    if (state.edit.peek() == 'lock') {
      return index
    }
  })

  function resetHandle(newHandle: Partial<handle>) {
    // which
    const _handle = { ...handle.peek(), ...newHandle }
    handle.set(_handle)

    // when
    // @ts-expect-error
    look.peek().previousValues = Clone(runtimeValues.peek().map(entry => entry.peek()))
    stopIndices = states.map((state, index) => {
      if (state.edit.peek() == 'lock') {
        return index
      }
    })
    // current
    resetTick(alignValueToStep(getEntryValue()))
  }
  function resetTick(tick: n) {
    return (startValue = previousValue = tick)
  }
  //#endregion

  //#region transform current values to step boundaries
  function walkValuesLimit(values: pair[], step: startEnd) {
    const lookup: pair[] = []
    let maxSize = 0
    for (const pair of values) {
      const i = values.indexOf(pair)
      const overflow = i == values.length - 1

      const complete = isPair(pair)
      const { min, gap } = rect.peek()
      const margin = min * complete
      const padding = gap * complete
      const offset = !overflow ? margin + padding || gap : 0

      const copy = Clone(pair) as pair
      if (complete) {
        const even = maxSize + margin
        if (copy.start) {
          copy.start = Backwards(step) ? maxSize : even
        }
        if (copy.end) {
          copy.end = Backwards(step) ? even : maxSize
        }
      } else {
        let key: startEnd = 'start'
        const single = copy[key] ?? copy[(key = 'end')]
        if (single) {
          copy[key] = maxSize
        }
      }
      lookup[i] = copy
      maxSize += offset
    }
    return lookup
  }
  function isPair(pair: pair) {
    return Object.values(pair).reduce((a, e, i) => a + i, 0)
  }
  //#endregion

  //#region Walker - MAIN LOGIC FLOW
  function threshold<T, F>(
    params: DeltaDirection &
      Pair & {
        with: (entry: ENTRY & Pair & Omit<DeltaDirection, 'backwards'> & { offset: n }) => true | n
      }
  ) {
    if (state.peek().push == 'set') {
      return
    }

    const check = createCollision(params)
    const _rect = objectMap(rect.peek(), v => v * check.direction * (state.peek().range ? 1 : 0))

    // extract first iteration ("sibling") to avoid redundant calls
    if (check.directionStep != params.step && state.peek().push == 'edges') {
      const sibling = getSibling(params)
      const offset = _rect.min

      if (check.collision(sibling.value! - offset, sibling.step)) {
        const returnValue = params.with({
          offset,
          tick: params.tick,
          value: sibling.value!,
          step: sibling.step,
          index: handle.peek().index,
        })
        // TODO: better abstraction
        if (typeof returnValue == 'boolean') {
          return
        } else {
          params.tick = returnValue
        }
      } else {
        return
      }
    }

    // then loop over your siblings, exclude the ones behind you
    const range = Backwards(check.directionStep)
      ? [...runtimeValues.peek()].slice(0, handle.peek().index).reverse()
      : [...runtimeValues.peek()].slice(handle.peek().index + 1)

    for (const _pair of range) {
      const pair = _pair.peek()
      const alignedPair = Object.entries(pair).sort((a, b) =>
        params.backwards ? b[1] - a[1] : a[1] - b[1]
      )

      const index = runtimeValues.peek().indexOf(_pair)
      if (stopIndices.includes(index)) {
        return
      }
      for (const [step, entry] of alignedPair) {
        const everyOther = step != check.directionStep || alignedPair.length == 1
        const offset = everyOther
          ? _rect.gap
          : state.peek().push == 'rangeSets'
          ? getPreviousOffset(index, step)
          : _rect.min
        if (check.collision(entry - offset)) {
          const returnValue = params.with({
            offset,
            tick: params.tick,
            value: entry,
            step: step as startEnd,
            index,
          })
          // TODO: better abstraction
          if (typeof returnValue == 'boolean') {
            return
          } else {
            params.tick = returnValue
          }
        } else {
          return
        }
      }
    }
  }
  type Direction = {
    step: startEnd
    backwards: b
  }
  type DeltaDirection = Direction & {
    tick: n
  }
  type Pair = {
    index: n
  }
  function getEdgeValue(entry: ENTRY & Pair & Direction) {
    if (!state.peek().range) {
      const { min, max } = settings.peek()
      const clamped = Math.min(Math.max(entry.value, min), max)
      return clamped
    }

    function computeEdge() {
      const { startLookup, endLookup, previousValues } = look.peek()
      // all unlocked
      if (!stopIndices.length) {
        const pair = entry.backwards ? startLookup[entry.index] : endLookup[entry.index]
        return pair[entry.step]!
      }
      // self
      if (stopIndices.includes(entry.index)) {
        const pair = previousValues[entry.index]
        return pair[entry.step]!
      }

      // check your siblings, exclude the ones behind you
      const range = entry.backwards
        ? [...stopIndices].slice(0, entry.index).reverse()
        : [...stopIndices].slice(entry.index + 1)

      const stop = range.find(stop => typeof stop == 'number')
      if (typeof stop == 'undefined') {
        const pair = entry.backwards ? startLookup[entry.index] : endLookup[entry.index]
        return pair[entry.step]!
      }

      const { min, gap } = rect.peek()
      const separation = stop - entry.index //* stopDirection
      const direction = separation > 0 ? 1 : -1
      const relation = separation - 2 * direction // why 2?
      const diff = Math.abs(separation) == 1
      const stopStart = (gap + min) * separation
      const stopEnd = diff
        ? gap * separation
        : // prettier-ignore
          (min * separation)+ (gap * relation)

      const { index, step, backwards } = entry
      // prettier-ignore
      if (index < stop) {
				const pair     = backwards
					? startLookup[index]
					: previousValues[stop]
				const pre      = step == 'end'   ? stopEnd : stopStart
				const offset   = backwards       ? 0       : pre
				const edgeStep = backwards       ? step    : 'start'
				return pair[edgeStep]! - offset
			} else {
				const pair     = !backwards
					? endLookup[index]
					: previousValues[stop]
				const pre      = step == 'start' ? stopEnd : stopStart
				const offset   = !backwards      ? 0       : pre
				const edgeStep = !backwards      ? step    : 'end'
				return pair[edgeStep]! - offset
			}
    }
    const maxSize = computeEdge()

    if (entry.backwards) {
      if (entry.value <= maxSize) {
        return maxSize
      }
    } else {
      if (entry.value >= maxSize) {
        return maxSize
      }
    }
    return entry.value
  }
  const isEven = (n: n) => n % 2 == 0
  function createCollision(params: DeltaDirection) {
    const directionStep = flipStep(params.backwards)
    const collision = (entryValue: n, step = directionStep) =>
      (Backwards(step) && params.tick < entryValue) ||
      (!Backwards(step) && params.tick > entryValue)

    return {
      directionStep,
      direction: Direction(params.backwards),
      collision,
    }
  }
  function getNextLink(params: DeltaDirection) {
    const check = createCollision(params)

    if (check.directionStep != params.step) {
      const sibling = getSibling(params)
      if (typeof sibling.value === 'number') {
        return <const>{
          hit: check.collision(sibling.value, sibling.step),
          backwards: !params.backwards,
          step: sibling.step,
          value: sibling.value,
          index: handle.peek().index,
        }
      }
    }

    const index = handle.peek().index + check.direction
    const pair = tryGetSibling(check.directionStep, index)

    if (typeof pair.entry === 'number') {
      return <const>{
        hit: check.collision(pair.entry, check.directionStep),
        backwards: !params.backwards,
        step: pair.step,
        value: pair.entry,
        index,
      }
    }
  }
  function tryGetSibling(directionStep: startEnd, nextIndex: n) {
    let step = flipStep(directionStep)
    const nextPair = runtimeValues.peek()[nextIndex]?.peek() ?? {}
    const entry = nextPair[step] ?? nextPair[(step = directionStep)]
    return { entry, step }
  }

  //#endregion

  //#region event emitter
  //const dispatch = createEventDispatcher()
  function getSibling(params: Direction) {
    const siblingStep = flipStep(params.step)
    const siblingValue = getEntryStep(siblingStep)
    return {
      step: siblingStep,
      value: siblingValue,
    }
  }

  //#endregion

  //#region dom helper
  type PosEvent = { clientY: n; clientX: n }
  function normalisedClient(e: unknown): PosEvent {
    // @ts-expect-error
    if (e.type.includes('touch')) {
      // @ts-expect-error
      return e.touches[0]
    } else {
      // @ts-expect-error
      return e
    }
  }
  //#endregion

  return {
    handle,
    settings,
    rect,
    state,
    moveHandle,
    handleInteractEvent,
    getHandleValue,
    getEntryBy,
    getPairs,
    resetHandle,
    tryGetSibling,
  }
}
