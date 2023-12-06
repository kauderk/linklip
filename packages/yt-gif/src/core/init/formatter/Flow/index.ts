import { ElementsPerBlock } from '../../../lib/dom/ytgif'
import { ObjKey_AtIndexInMap } from '../../../lib/backend-frontend/map-query'
import { NonReferencedPerBlock, replaceString } from '../../../lib/helpers'
import { UIDtoURLInstancesMapMap } from '../../../lib/types/config'
import { updateBlock } from '$v3/integration/notion'
import { TryToUpdateBlockSubString } from '../update'
import type {
  FormatterInterface,
  FormatterButton,
} from '$v3/init/observer/timestamp/emulation/types'

export async function TryToUpdateBlock_fmt<T extends FormatterInterface | FormatterButton>({
  block,
  targetNode,
  siblingSel,
  selfSel,
  getMap,
  isKey,
  fmtCmpnt_cb,
  tempUID,
  from,
}: T) {
  // Grab, if any, nested block information
  const siblingIndex = ElementsPerBlock(block, siblingSel).indexOf(targetNode)
  const selfIndex = NonReferencedPerBlock(block, selfSel, targetNode).indexOf(targetNode)
  const map = await getMap()
  const ObjAsKey = ObjKey_AtIndexInMap(map, siblingIndex, isKey)!

  // exit if the information isn't available
  const { uid, capture } = ObjAsKey ?? {}
  if (!capture || !uid || selfIndex == -1) return

  try {
    // update the block
    const url = await fmtCmpnt_cb({ url: ObjAsKey.value })
    await updateBlock(ObjAsKey.capture(), {
      block_id: uid,
      paragraph: {
        rich_text: {
          [ObjAsKey.index]: {
            text: {
              content: url,
              link: { url },
            },
          },
        },
      },
    })

    UIDtoURLInstancesMapMap.delete(uid)
    UIDtoURLInstancesMapMap.delete(tempUID)
    return { url }
  } catch (error: any) {
    console.error(error)
    return
  }
}
