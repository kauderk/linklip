<script lang="ts">
  /**
   * @event {string} type
   * @event {any} clear
   */
  export let value = ''
  export let autofocus = false
  export let debounce = 0
  export let labelText = 'Label'
  export let hideLabel = false
  export let id = 'search' + Math.random().toString(36)
  export let removeFormAriaAttributes = false
  export let inputRef: HTMLElement | undefined = undefined

  import { createEventDispatcher, onMount, afterUpdate } from 'svelte'

  const dispatch = createEventDispatcher()

  let prevValue = value
  let timeout: NodeJS.Timeout
  let calling = false

  function debounced(cb: Function) {
    if (calling) return
    calling = true
    timeout = setTimeout(() => {
      cb()
      calling = false
    }, debounce)
  }

  onMount(() => {
    if (autofocus) window.requestAnimationFrame(() => inputRef?.focus())
    return () => clearTimeout(timeout)
  })

  afterUpdate(() => {
    if (value.length > 0 && value !== prevValue) {
      if (debounce > 0) {
        debounced(() => dispatch('type', value))
      } else {
        dispatch('type', value)
      }
    }

    if (value.length === 0 && prevValue.length > 0) dispatch('clear')

    prevValue = value
  })

  const form = <const>{
    role: removeFormAriaAttributes ? null : 'search',
    'aria-labelledby': removeFormAriaAttributes ? null : id,
  }
  const label = <const>{
    id: id + 'label',
    for: id,
    hideLabel,
    label: labelText,
  }
  const input = <const>{
    name: 'search',
    type: 'search',
    placeholder: 'Search...',
    autocomplete: 'off',
    spellcheck: 'false',
    rest: $$restProps,
    id,
  }
</script>

<slot {form} {label} {input} />

<style>
  /**
	* Visually hide content without breaking screen readers
	* https://a11yproject.com/posts/how-to-hide-content/
	*/
  :global(.hide-label) {
    position: absolute;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px);
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
  }
</style>
