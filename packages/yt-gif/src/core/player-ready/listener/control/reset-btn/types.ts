export interface HTMLResetButton extends HTMLElement {
  ResetBoundaries_smart: (e: HTMLResetEvent | null) => Promise<void>
}

export interface HTMLResetEvent {
  message?: string
  blockID?: string
  currentTarget?: HTMLElement
  ['delete-obs-tm']?: boolean
}
