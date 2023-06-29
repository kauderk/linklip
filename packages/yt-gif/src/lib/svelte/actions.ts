export function clickOutside(node: HTMLElement) {
  // https://svelte.dev/tutorial/actions
  const handleClick = (event: any) => {
    if (!node.contains(event.target)) {
      node.dispatchEvent(new CustomEvent('clickOutside'))
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}
