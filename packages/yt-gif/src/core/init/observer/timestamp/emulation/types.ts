import type { TBlockInfo } from '$v3/init/formatter/update/types'
import type { HTMLTimestampClickEventDetail } from '../click/types'

export interface FormmaterHTMLElement extends HTMLElement {
  tryToAppendUrlBtns: Function
  a: HTMLElement
}
export interface FormmatterActionsHTMLElement extends FormmaterHTMLElement {
  OnClicks: (e: HTMLTimestampClickEventDetail) => Promise<void>
  validateSelf: (v: number) => void
}
interface ActiveTimestamp {
  index: number
}
export interface LastActiveTimestamp {
  lastActiveTimestamp: {
    target: BaseTimestampObject & ActiveTimestamp
    blockIndex: number
    workflow: string
    start: ActiveTimestamp
    end: ActiveTimestamp
    blockID: string
  }
  //workflow?: string
}
type BaseObjAsKey = {
  uid: s
  capture: any
}
type ValuesFromCompoentMap = {
  isKey: isKey
}
type PageProperties = {
  page: Tpage
}
interface TimestampObject extends BaseTimestampObject, FormatterRawElements, PageProperties {}
interface TimestampSetObject {
  pear:
    | (TimestampObject & {
        ObjAsKey: BaseObjAsKey
      })
    | null
  self: BaseTimestampObject
  //other: Itms
}
interface BaseTimestampObject {
  timestamp: string
}

export interface ExtraFormmatter extends Omit<FormatterObject, 'from'> {
  from: {
    value: s
    param: s
    float?: boolean
  }
}

export interface TimestampFormatter extends FormatterObject {
  from: FormatterObject['from'] & {
    sel: (s: s, p: Tpage) => s
  }
}
export type FormatterFunction = (
  o: any
  //o: TimestampFormatter | ExtraFormmatter | FormatterObject
) => Promise<string>

export interface FormatterButton extends Omit<FormatterInterface, 'from'> {
  from: {
    page?: Tpage
    caster: string
  }
}

export interface FormatterObject extends BaseObjAsKey {
  string: s
  start: number
  end: number

  to: Array<Tpage>
  from: PageProperties & {
    tmSetObj: TimestampSetObject // FIXME: can be optional
  }
  recycledRequest: TBlockInfo[][]
}
interface FormatterRawElements {
  block: PossibleBlock
  targetNode: HTMLElement
}
export interface FormatterInterface extends ValuesFromCompoentMap, FormatterRawElements {
  siblingSel: s
  selfSel: s

  getMap: () => Promise<Trm_map>

  fmtCmpnt_cb: FormatterFunction
  tempUID: s

  from: FormatterObject['from']
  //caster?: string
}
export interface FormatterObjectAsKey extends BaseObjAsKey, ValuesFromCompoentMap {
  indent: number
  index: number
  value: string

  similarCount: number

  isKeyOrder: number
  order: number
}
