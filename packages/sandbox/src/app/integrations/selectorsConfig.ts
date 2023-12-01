import type { FollowerConfig } from '../controller/follower'
import { cornerFollowerCycle, observerSelectors } from '../follower/corner'
import { selectorsFuncs } from '../follower/selectors'
import { createConfig, followerCycle } from '../integrations/followerCycles'

export function createSelectorsConfig(
  playerConfig: Pick<
    ReturnType<typeof createConfig>,
    'aspectRatio' | 'rect' | 'stage' | 'resizeMode'
  > & {
    notionRef: () => {
      notionHref: HTMLElement
      containerID: string
    }
  }
) {
  type XY = typeof cornerOffset
  let cornerOffset = { y: 70, x: 20 }
  const originalCornerOffset = { ...cornerOffset }

  // FIXME: should unify object
  const followerUpdate = {
    // FIXME: requires cyclic update
    notionRef: playerConfig.notionRef,
    notionCleanUp(containerID: string) {
      if (!document.querySelector(`.notion-text-block[data-block-id="${containerID}"]`)) {
        // notion gave the block a new ID, so we need to destroy the old style
        removeNotionHrefStyle(containerID)
      }
    },
    offset(delta: (tick: XY, original: XY) => Partial<XY>) {
      cornerOffset = {
        ...cornerOffset,
        ...delta(cornerOffset, originalCornerOffset),
      }
    },
  }
  function baseSelector(selector = '') {
    return () => {
      const id = followerUpdate.notionRef().containerID
      return `.notion-text-block[data-block-id="${id}"] [href*="youtu"]${selector}`
    }
  }
  const followerConfig = {
    selectors: {
      notionLink: {
        selector: {
          target: baseSelector(),
          pointerTarget: baseSelector('>span'),
          outline: baseSelector(),
          pointer: true,
        },
        observerSelectors,
        styleHost() {
          const { notionHref, containerID } = followerUpdate.notionRef()
          if (playerConfig.stage.peek().mode == 'host' && isRendered(notionHref)) {
            const maxWidth = notionHref.closest('.notranslate')?.clientWidth || 350
            const width = playerConfig.rect.peek().width
            const rect = {
              width,
              maxWidth,
              height: width / playerConfig.aspectRatio.value,
              maxHeight: maxWidth / playerConfig.aspectRatio.value,
            }
            createNotionHrefStyle(containerID, rect)
          } else {
            removeNotionHrefStyle(containerID)
          }
        },
        followerCycle,
        postBranch() {
          playerConfig.resizeMode = 'inlineBlock'
        },
      },
      theater: {
        selector: {
          target: `.theater_content`,
        },
        followerCycle: {
          update: followerCycle.update,
        },
        preBranch(payload) {
          const gallery = document.querySelector('.theater_content')
          // @ts-expect-error
          return gallery?.branch(null, payload.selected) // Promise
        },
      },
      sharedControls: {
        selector: {
          target: '.shared-controls *',
          outline: '.shared-controls',
          pointer: true,
        },
        observerSelectors,
        // FIXME: abstract stageSignal
        // stageSignal: props.stages.sharedControls,
        followerCycle,
      },
      notionPage: {
        selector: {
          target: '.notion-page-content',
        },
        observerSelectors,
        followerCycle: cornerFollowerCycle({
          update: r => ({
            ...r,
            x: r.x - cornerOffset.x,
            y: r.y - cornerOffset.y,
          }),
          resize: (r, i, e) => ({
            ...r,
            width: i.width,
            x: e.right - i.width - cornerOffset.x,
            y: r.y - cornerOffset.y,
          }),
        }),
      },
      notionTopBar: {
        selector: {
          target: '.notion-topbar > div',
        },
        followerCycle: {
          update(hostRef) {
            return () => {
              // prettier-ignore
              const startFrom = hostRef.querySelector('div.notranslate.shadow-cursor-breadcrumb')!.getBoundingClientRect()
              const hostRect = hostRef.getBoundingClientRect()
              // if the hostRect is at x:0, y: 0, width: 100, height: 30
              // return at x: 20%, y: 0, width: 60%, height: 30
              const xPadding = 15
              const height = hostRect.height
              const width = height * (16 / 9)
              return {
                x: startFrom.right + xPadding,
                y: hostRect.top,
                width,
                height,
              }
            }
          },
          // TODO: should provide the rect
          clean(followerRef) {
            if (!followerRef) return
            const width = 350 + 1 // TODO: _Config.width
            playerConfig.rect.set({
              ...playerConfig.rect.peek(),
              width,
              height: width / playerConfig.aspectRatio.value,
            })
          },
        },
      },
      notionMainScroller: {
        selector: {
          target: '.notion-scroller main',
        },
        followerCycle: {
          update(hostRef, _, signal) {
            return () => {
              const crr = signal.peek()
              const v = selectorsFuncs.notionMainScroller.update(hostRef)
              return {
                ...crr,
                x: v.x + v.width - crr.width - cornerOffset.x,
                y: window.innerHeight - crr.height - cornerOffset.y,
              }
            }
          },
        },
        postBranch() {
          playerConfig.resizeMode = 'inlineBlockReversed'
        },
      },
      leftGallery: {
        selector: {
          target: '.left .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .left .items',
          resize: '.gallery .left .items',
        },
      },
      rightGallery: {
        selector: {
          target: '.right .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .right .items',
          resize: '.gallery .right .items',
        },
      },
      topGallery: {
        selector: {
          target: '.top .item.block',
        },
        followerCycle,
        preBranch,
        observerSelectors: {
          scroll: '.gallery .top .items',
          resize: '.gallery .top .items',
          window: false,
        },
      },
    },
    hostLess: {
      postBranch() {
        playerConfig.resizeMode = 'pictureInPicture'

        // FIXME: abstract follower
        // props.follower.styleHost(false)

        // if it was "affected" by the intersection observer
        // restore its full size when in free mode
        const old = playerConfig.rect.peek()
        playerConfig.rect.set({
          ...old,
          height: old.width / playerConfig.aspectRatio.value,
        })
      },
    },
  } satisfies FollowerConfig
  function preBranch(payload: { selected: boolean }) {
    // @ts-expect-error
    const direction = this.selector.target.split(' ')[0].slice(1)
    const gallery = document.querySelector('.gallery-' + direction)
    // @ts-expect-error
    return gallery?.branch('[href*="youtu"]>span', payload.selected) // Promise
  }

  return { followerConfig, followerUpdate }
}

function createNotionHrefStyle(containerID: string, _rect: any) {
  const style = getNotionHrefStyle(containerID)

  if (_rect.height < 50 || _rect.width < 50) {
    console.log('Abort host styling', _rect)
    return
  }
  // style the target to accommodate the portal
  style.innerHTML = `
		[data-block-id="${containerID}"] 
		a.notion-link-token.notion-focusable-token.notion-enable-hover {
			all: unset;

			height: ${_rect.height}px; 
			width: ${_rect.width}px;
			max-width: ${_rect.maxWidth}px;
			max-height: ${_rect.maxHeight}px;

			outline: 1px solid black;
			border-radius: .2em;

			display: block;
		}
	`.trim()
  document.head.appendChild(style)
  style.id = styleID + containerID
}
const styleID = `linklip-follower-portal`
function getNotionHrefStyle(containerID: string) {
  return document.getElementById(styleID + containerID) ?? document.createElement('style')
}
function removeNotionHrefStyle(containerID: string) {
  getNotionHrefStyle(containerID).innerHTML = ''
}
export function isRendered(el?: Element): el is HTMLElement {
  return document.contains(el!)
}
