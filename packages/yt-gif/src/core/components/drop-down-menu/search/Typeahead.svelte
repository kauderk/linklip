<script lang="ts">
  type T = $$Generic
  type TItem = T

  export let id = 'typeahead-' + Math.random().toString(36)
  export let value = ''

  export let data: TItem[]

  export let extract: (item: TItem) => string

  export let disable: (item: TItem) => boolean = item => false

  export let filter: (item: TItem) => boolean = item => false

  /** Set to `false` to prevent the first result from being selected */
  export let autoselect = true

  /**
   * Set to `keep` to keep the search field unchanged after select, set to `clear` to auto-clear search field
   */
  export let inputAfterSelect: 'update' | 'clear' | 'keep' = 'update'

  export let results: {
    original: TItem
    index: number
    score: number
    string: string
    disabled?: boolean
  }[] = []

  /** Set to `true` to re-focus the input after selecting a result */
  export let focusAfterSelect = false

  /** Set to `true` to only show results when the input is focused */
  export let showDropdownOnFocus = false

  /** Set to `true` for all results to be shown when an empty input is focused */
  export let showAllResultsOnFocus = false

  /**
   * Specify the maximum number of results to return
   */
  export let limit: number = Infinity

  import fuzzy from 'fuzzy'
  import Search from './Search.svelte'
  import { tick, createEventDispatcher, afterUpdate } from 'svelte'
  import { destroyEvents } from './actions'
  import { stack } from './store'
  import { sleep } from '$lib/utils'

  type Result = (typeof results)[number]
  const dispatch = createEventDispatcher<{
    select: {
      selectedIndex: n
      searched: s
      selected: s
      original: any
      originalIndex: n
    }
  }>()

  export let inputRef: HTMLElement | undefined = undefined
  let hideDropdown = false
  let selectedIndex = -1
  let prevResults = ''
  let isFocused = false

  afterUpdate(() => {
    if (prevResults !== resultsId && autoselect) {
      selectedIndex = getNextNonDisabledIndex()
    }

    if (prevResults !== resultsId && !$$slots['no-results']) {
      hideDropdown = results.length === 0
    }

    prevResults = resultsId
  })

  async function select() {
    const result = results[selectedIndex]

    if (result.disabled) return

    const selectedValue = extract(result.original)
    const searchedValue = value

    if (inputAfterSelect == 'clear') value = ''
    if (inputAfterSelect == 'update') value = selectedValue

    $stack = [...new Set([...$stack, searchedValue])]
    dispatch('select', {
      selectedIndex,
      searched: searchedValue,
      selected: selectedValue,
      original: result.original,
      originalIndex: result.index,
    })

    await tick()

    if (focusAfterSelect) inputRef?.focus()
    close()
  }

  function getNextNonDisabledIndex() {
    let index = 0
    let disabled = results[index]?.disabled ?? false

    while (disabled) {
      if (index === results.length) {
        index = 0
      } else {
        index += 1
      }

      disabled = results[index]?.disabled ?? false
    }

    return index
  }

  function change(direction: -1 | 1) {
    let index =
      direction === 1 && selectedIndex === results.length - 1 ? 0 : selectedIndex + direction
    if (index < 0) index = results.length - 1

    let disabled = results[index].disabled

    while (disabled) {
      if (index === results.length) {
        index = 0
      } else {
        index += direction
      }

      disabled = results[index].disabled
    }

    selectedIndex = index
  }

  const open = () => (hideDropdown = false)
  const close = () => {
    hideDropdown = true
    isFocused = false
  }

  $: options = { pre: '<mark>', post: '</mark>', extract }
  $: results = fuzzy
    .filter(value, data, options)
    .filter(({ score }) => score > 0)
    .slice(0, limit)
    .filter(result => !filter(result.original))
    .map(result => ({ ...result, disabled: disable(result.original) }))
  $: resultsId = results.map(result => extract(result.original)).join('')
  $: showResults = !hideDropdown && results.length > 0
  $: if (showDropdownOnFocus) {
    showResults = showResults && isFocused
  }
  $: if (isFocused && showAllResultsOnFocus && value.length === 0) {
    results = data
      .filter(datum => !filter(datum))
      .map((original, index) => ({
        disabled: disable(original),
        index,
        original,
        score: 0,
        string: extract(original),
      }))
  }

  export const wrapper = <const>{
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-controls': `${id}-listbox`,
    'aria-expanded': showResults,
    dropdown: results.length > 0,
    id: `${id}-typeahead`,
  }
  export const ul = <const>{
    'svelte-typeahead-list': true,
    role: 'listbox',
    'aria-labelledby': `${id}-label`,
    id: `${id}-listbox`,
  }
  let lastResult: Result | undefined = undefined
  $: resultMap = filterResults(value)

  function filterResults(value: s) {
    return results.map((result, index) => ({
      click: () => {
        if (result.disabled) return
        selectedIndex = index
        select()
      },
      mouseenter: () => {
        if (result.disabled) return
        selectedIndex = index
      },
      li: {
        role: 'option',
        id: `${id}-result-${index}`,
        selected: selectedIndex === index,
        disabled: result.disabled,
      },
      result: (lastResult = result),
      index,
      value,
    }))
  }
  export const closeClickOutside = (target: HTMLElement) => {
    const outside = (event: MouseEvent) => {
      const trace =
        hideDropdown ||
        // @ts-expect-error
        target?.contains(event.target) ||
        // @ts-expect-error should be an array of options
        inputRef?.contains(event.target)
      if (!trace) {
        close()
      }
    }
    window.addEventListener('click', outside)
    return {
      destroy() {
        window.removeEventListener('click', outside)
        target.remove()
      },
    }
  }
  let stackIndex = -1
  export const inputRefAction = (target: HTMLInputElement) => {
    const placeholder = target.placeholder
    const keydown = (e: KeyboardEvent) => {
      if (results.length === 0) {
        switch (e.key) {
          case 'Enter':
            target.placeholder = placeholder
            value = target.value = $stack[stackIndex] ?? ''
            //select()
            break
          case 'ArrowDown':
            e.preventDefault()
            // latest
            stackIndex = stackIndex - 1 < 0 ? $stack.length - 1 : stackIndex - 1
            target.placeholder = $stack[stackIndex] ?? target.placeholder
            break
          case 'ArrowUp':
            e.preventDefault()
            // oldest
            stackIndex = (stackIndex + 1) % $stack.length
            target.placeholder = $stack[stackIndex] ?? target.placeholder
            break
          case 'Escape':
            Escape(e)
            break
        }
        return
      }

      switch (e.key) {
        case 'Enter':
          select()
          break
        case 'ArrowDown':
          e.preventDefault()
          change(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          change(-1)
          break
        case 'Escape':
          Escape(e)
          break
      }
    }
    const focus = () => {
      open()
      if (showDropdownOnFocus || showAllResultsOnFocus) {
        showResults = true
        isFocused = true
      }
    }

    function Escape(e: KeyboardEvent) {
      e.preventDefault()
      stackIndex = -1
      target.placeholder = placeholder
      target.focus()
      close()
      value = '' // interesting...
      tick().then(() => (target.value = ''))
    }
    inputRef = target
    // @ts-expect-error
    return destroyEvents(target, { keydown, focus })
  }
</script>

<slot name="search" />

<slot {resultMap} {showResults} {closeClickOutside} {inputRefAction} {selectedIndex} />

{#if $$slots['no-results'] && !hideDropdown && value.length > 0 && results.length === 0}
  <slot name="no-results" {value} {lastResult} />
{/if}
