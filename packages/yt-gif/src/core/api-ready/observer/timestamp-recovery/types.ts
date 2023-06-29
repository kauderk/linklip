import type { DeployEvent, DeployEventName } from '$v3/components/yt-gif/player/actions'
import type { IExtendedVideoParams } from '$v3/lib/types/video-types'
import type { YT_TargetWrapper } from '$v3/lib/types/yt-types'

export interface LifeCycle {
  deployType?: DeployEventName[]
  onIgnition?(wrapper: HTMLElement, api: YT_TargetWrapper): void | Promise<void>
  onDeploy?(e: DeployEvent, config: IExtendedVideoParams): void | Promise<void>
}
