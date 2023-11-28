export function isRendered(el?: El) {
  return document.contains(el!)
}
