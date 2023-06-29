import { closestBlock } from './elements-yt-gif-parent'

export function ElementsPerBlock(block: PossibleBlock, selector: string) {
  if (!block) return []

  return block
    .queryAllasArr(selector)
    .filter(b => closestBlock(b)?.dataset.blockId == block.dataset.blockId) // FIXME: could be null checks
}
