import type { FollowerCycle, Rect } from '../controller/follower'

type x = {
  update: (preRect: Rect) => Rect
  resize: (preRect: Rect, initRect: Rect, entry: DOMRectReadOnly) => Rect
}
export const cornerFollowerCycle = (pre: x) => {
  return {
    update(hostRef, initRect) {
      return {
        value: () => {
          const rect = hostRef.getBoundingClientRect()
          return pre.update({
            x: rect.x,
            width: rect.width,
            y: rect.bottom - initRect.height,
            height: initRect.height,
          })
        },
        mode: 'new',
        hostRef,
        canIntersect: true,
      }
    },
    resize(followerRef, entry, initRect, isFull) {
      if (isFull) {
        return
      }

      const bottomOffset = entry.boundingClientRect.bottom - entry.intersectionRect.bottom

      // prettier-ignore
      return {
				value: pre.resize({
					x: entry.intersectionRect.x,
					width: entry.intersectionRect.width,
					y: (entry.boundingClientRect.bottom - initRect.height) + bottomOffset,
					height: initRect.height,
				}, initRect, entry.intersectionRect),
				mode: 'update',
				canIntersect: true,
			}
    },
  } satisfies FollowerCycle
}

export const defaultCornerFollowerCycle = cornerFollowerCycle({
  update: r => r,
  resize: r => r,
})

export const observerSelectors = {
  scroll: '.notion-frame .notion-scroller',
  resize: '.notion-page-content',
}
