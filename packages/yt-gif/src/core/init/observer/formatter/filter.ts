import { isRendered } from '$v3/lib/dom/elements-yt-gif-parent'
import { YTGIF_Config } from '$v3/lib/types/config'

export function getYTUrlObj(rm_btn: El) {
  const ytUrlEl = rm_btn as HTMLLinkElement

  let url = ytUrlEl?.href

  if (!YTGIF_Config.guardClause(url)) url = ''

  return <const>{ url, ytUrlEl }
}
export function mutationTargets(mutationsList: MutationRecord[], selectors: string) {
  let added: HTMLElement[] = []
  for (const { addedNodes } of mutationsList) {
    added = [...added, ...NodesRecord(addedNodes, selectors)]
  }
  return added
}
function NodesRecord(Nodes: NodeList, sel: s) {
  if (!Nodes || Nodes.length == 0) return []

  return (Array.from(Nodes) as HTMLElement[])
    .map(x => {
      if (!!x.tagName) return
      if (x.matches(sel)) return x
      else return Array.from(x.querySelectorAll(sel))
    })
    .flat(Infinity)
    .filter((node: any, i, a) => {
      return !!node && a.indexOf(node) === i && isRendered(node)
    }) as HTMLElement[]
}
