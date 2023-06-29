import type { YT_GIF_OBSERVERS_TEMP } from '$v3/init/config/yt-gif-init'

export const SrrGlobal = {
  roamAlphaAPI: {} as any,
  AvoidCircularDependency: {} as any,
  YTGIF: {} as any,
  YT_GIF_OBSERVERS: <typeof YT_GIF_OBSERVERS_TEMP>{},
}
