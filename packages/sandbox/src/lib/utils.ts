export function isRendered(el?: El): el is HTMLElement {
  return document.contains(el!)
}
