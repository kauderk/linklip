import type { FormmaterHTMLElement } from '../emulation/types'
export interface HTMLTimestampClickEventDetail extends MouseEvent {
  currentTarget: FormmaterHTMLElement
  which: number
  seekToMessage: string
  mute: boolean
  simMessage: string
}

export interface HTMLClickEventOverride {
  simMessage?: string
  seekToMessage?: string
}
