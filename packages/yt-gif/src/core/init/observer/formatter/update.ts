import { URL_Config } from '../../../lib/types/config'
import { getComponentMap } from '../../../lib/backend-frontend/get-maps'
import { closestBlock, getUidFromBlock } from '../../../lib/dom/elements-yt-gif-parent'
import { awaitingAtrr } from '../../../lib/dom/attr'
import { TryToUpdateBlock_fmt } from '../../formatter/Flow'
import { getYTUrlObj } from './filter'
import { ValidUrlBtnUsage } from '$v3/init/formatter/button/validation'
import type { FormatterFunction, FormatterButton } from '../timestamp/emulation/types'

export async function OnYtGifUrlBtn(
  target: HTMLElement,
  fmtCmpnt_cb: FormatterFunction,
  fromObj = {}
) {
  const block = closestBlock(target)
  const tempUID = getUidFromBlock(block)
  const { url, ytUrlEl } = getYTUrlObj(target)

  if (!tempUID || !url) {
    console.warn(`YT GIF Url Button: Couldn't find any url within the block with uuid: ${tempUID}`)
    return
  }

  const settings = <const>{
    block,
    targetNode: ytUrlEl,

    siblingSel: `.notion-link-token[href*="youtu"]`,
    selfSel: `.notion-link-token[href*="${url}"]`,

    getMap: async () => getComponentMap(tempUID, URL_Config),
    isKey: 'is substring',

    tempUID,
    fmtCmpnt_cb,

    from: {
      caster: 'notion-link',

      ...fromObj,
    },
    ...fromObj,
  }

  return await TryToUpdateBlock_fmt(settings)
}
