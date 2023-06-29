import { isRendered } from '../dom/elements-yt-gif-parent'
import { allVideoParameters } from '../types/config'
import type { YT_TargetWrapper } from '../types/yt-types'
import { sleep } from '$lib/utils'
import { SrrGlobal } from '$lib/global/SrrGlobal'

/* ***************** */
export async function TryReloadVideo({
  t,
  start,
  end,
}: {
  t: YT_TargetWrapper | undefined
  start: number
  end: number
}) {
  if (!t || t?.events.reloading) return
  t.events.reloading = true

  const vars = t.GetPlayerVars()
  const config = allVideoParameters.get(t.GetIframeID())
  if (!config) {
    console.warn(
      `YT GIF: ReloadYTVideo: Couldn't find VideoConfigParameters for ${t.GetIframeID()}`
    )
  }

  const iframe = t.getIframe()

  vars.start = start || 0
  vars.end = end || t.getDuration()

  if (config?.start.value == start && config?.end.value == end) {
    while (isRendered(iframe) && !t.ApiIsWorking()) {
      await sleep(50)
    }
    t.seekTo(start)
    t.events.reloading = false
    return
  }

  config?.start.set((vars.start = start))
  config?.end.set((vars.end = end))
  const vol = t.getVolume()

  while (isRendered(iframe) && !t.ApiIsWorking()) {
    await sleep(50)
  }

  // ...to prevent double "endState"
  await t.loadVideoById({
    // ...it requirers to set "endSeconds" once again
    videoId: t.GetVideoID(),
    startSeconds: start,
    endSeconds: end,
  })

  await t.WhileApiHolds({ delay: 50, iframe })

  t.setVolume(vol)

  t.events.reloading = false
}
