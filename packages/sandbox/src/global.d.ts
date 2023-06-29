/// <reference types="@sveltejs/kit" />

export {}

declare global {
  //#region Global

  //#endregion

  type Tpage = 'yt-gif' | 'format' | 'url' | startEnd | 'start|end'
  type startEnd = 'start' | 'end'
  type rm_key = 'video' | 'yt_gif' | 'both'
  type isKey =
    | 'is tooltip card'
    | 'is substring'
    | 'is component'
    | 'is alias'
    | 'is block reference'

  type FString = () => string
  type FNumber = () => number
  type FVoid = () => void
  type s = string
  type o = Object
  type n = number
  type b = boolean
  type El = Element
  type HEl = HTMLElement

  type Tobserver = MutationObserver | IntersectionObserver
  type Trm_map = Map<string | FormatterObjectAsKey, string | Trm_map>
  type Trm_map_entry = [string | FormatterObjectAsKey, string | Trm_map]
  type StrSearch = string | undefined
  type BolSearch = boolean | undefined
  type QrySearch = Element | null | undefined
  type TGifTarget = 'yt-gif|video' | 'video' | 'yt-gif'
}
