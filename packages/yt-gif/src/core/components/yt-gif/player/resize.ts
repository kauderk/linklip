import { debounce } from '$lib/utils'
import { readable } from 'svelte/store'

export const windowResizeEventStore = readable(new Event('resize'), set => {
  const debouncedResizeWindow = debounce(set, 300)

  window.addEventListener('resize', debouncedResizeWindow)
  return () => {
    window.removeEventListener('resize', debouncedResizeWindow)
  }
})
