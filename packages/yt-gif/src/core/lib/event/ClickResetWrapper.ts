import type {
  HTMLResetButton,
  HTMLResetEvent,
} from '$v3/player-ready/listener/control/reset-btn/types'

export async function ClickResetWrapper(
  targetWrapper: QrySearch,
  assignObj: HTMLResetEvent | null = null
) {
  if (!targetWrapper) return

  const reset = targetWrapper.querySelector('[data-yt-gif-url-btn="reset"]') as HTMLResetButton

  if (assignObj && 'delete-obs-tm' in assignObj)
    // alright
    reset.dispatchEvent(
      new CustomEvent('customDelObsTimestmp', {
        bubbles: true,
        cancelBubble: true,
        cancelable: true,
        detail: {
          blockID: assignObj.blockID,
        },
      })
    )
  // @ts-expect-error
  await targetWrapper?.ResetBoundaries_smart?.(assignObj)
}
