export function mutationTargets(mutationsList: MutationRecord[], targetClass: string[]) {
  const found: El[] = []

  for (const { addedNodes } of mutationsList) {
    for (const node of Array.from(addedNodes) as Element[]) {
      if (!node.tagName) continue // not an element

      if (targetClass.some(c => node.classList.contains(c))) {
        found.push(node)
      } else if (node.firstElementChild) {
        targetClass.forEach(c => found.push(...Array.from(node.getElementsByClassName(c))))
      }
    }
  }
  return found as HTMLElement[]
}
