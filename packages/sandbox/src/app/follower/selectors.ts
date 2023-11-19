export const selectorsFuncs = {
  notionMainScroller: {
    update(hostRef: Element) {
      const hostRect = hostRef.getBoundingClientRect()
      const height = 50
      const width = hostRect.width
      // center it vertically, max width 1000 and 50 height at the bottom
      return {
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight - height,
        width,
        height,
      }
    },
  },
}
