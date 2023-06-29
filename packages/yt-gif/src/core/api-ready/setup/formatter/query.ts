import { getUrlMap_smart } from '$v3/lib/backend-frontend/get-maps'
import { TryToUpdateBlock_fmt } from '$v3/init/formatter/Flow'
import type {
  FormatterButton,
  FormatterFunction,
} from '$v3/init/observer/timestamp/emulation/types'

export async function ytGif_FormatterAction(
  formatterCallback: FormatterFunction,
  instance: IInstance
) {
  return await createActionSettings(formatterCallback, instance, {})
    .then(TryToUpdateBlock_fmt)
    .catch()
}
export async function ytGif_InsertAction(
  insertCallback: FormatterFunction,
  instance: IInstance,
  fromObj = {}
) {
  return await createActionSettings(insertCallback, instance, fromObj)
    .then(TryToUpdateBlock_fmt)
    .catch()
}
export interface IInstanceElements {
  grandParentBlock: HTMLElement | undefined
  wrapper: HTMLElement | undefined
}
export interface IInstance extends IInstanceElements {
  url: s
  uid: s
}
async function createActionSettings(
  actionCallback: FormatterFunction,
  instance: IInstance,
  fromObj = {}
): Promise<FormatterButton> {
  if (!instance.wrapper) {
    throw new Error('YT GIF Invalid iframe wrapper')
  }
  return <const>{
    block: instance.grandParentBlock,
    targetNode: instance.wrapper,

    siblingSel: '.yt-gif-wrapper',
    selfSel: `[data-video-url="${instance.url}"]`,

    getMap: async () => getUrlMap_smart(instance.uid),
    isKey: 'is component',

    tempUID: instance.uid,

    from: {
      caster: 'player',
      page: 'yt-gif',
      //urlBtn: e.target as El,
      ...fromObj,
    },
    fmtCmpnt_cb: actionCallback,
  }
}
