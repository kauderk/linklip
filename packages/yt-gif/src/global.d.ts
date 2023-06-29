import { ApiPromise } from '$v3/api-ready/gate'
import type Announcer from '$v3/components/announcer/App/Announcer.svelte'
import type DropdownMenu from '$v3/components/drop-down-menu/App/DropDownMenu.svelte'
import type { T_settings_map } from '$v3/settings-page/types'
import { PossibleBlock, BLOCK, BLOCKSeach } from '$srccore/integration/notion'
/// <reference types="@sveltejs/kit" />

export {}

declare global {
  //#region Global
  interface Window {
    YT
    roamAlphaAPI
    YT_GIF_DIRECT_SETTINGS: T_settings_map
    YTGIF_EXTENSION_STORE: {
      apiTask: ApiPromise
      dropDownMenu: DropdownMenu | undefined
      announcers: Announcer[]
    }
  }
  interface Document {
    queryAllasArr<type = Element>(length: string): type[]
  }
  interface Element {
    queryAllasArr<type = Element>(length: string): type[]
  }
  interface HTMLElement {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends string, EV extends CustomEvent<T>>(
      type: K,
      listener: (ev: EV) => void
    ): void
  }
  export interface CustomEventInit {
    cancelBubble: boolean
  }
  interface Array<T> {
    Last(): T
  }
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
  type PossibleBlock =
    | Element & {
        dataset: { blockId?: s }
        closest: (sel: s) => PossibleBlock
        queryAllasArr<type = Element>(length: string): type[]
      }
    | null
    | undefined
  type BLOCK = { dataset: { blockId: s }; closest: (sel: s) => PossibleBlock }
  type BLOCKSeach = BLOCK | null | undefined
}
