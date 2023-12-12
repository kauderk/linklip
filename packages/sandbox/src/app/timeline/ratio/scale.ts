import { high as storyboard } from '$mock/storyboard.json'
import type { Rect } from 'src/app/controller/follower'

export function deriveScale($rect: Rect, count: n) {
  const { thumbnailWidth, thumbnailHeight } = storyboard.slot
  const height = $rect.height * 0.95
  const width = $rect.width * 1
  const containerArea = width * height
  const aspectRatio = width / height / (count * 10)

  const columns = Math.ceil(Math.sqrt((count * thumbnailWidth) / thumbnailHeight))
  const rows = Math.ceil(count / columns)
  const totalWidthRequired = columns * thumbnailWidth
  const totalHeightRequired = rows * thumbnailHeight
  const totalAreaRequired = totalWidthRequired * totalHeightRequired
  const scaleFactor = Math.sqrt(containerArea / totalAreaRequired) - aspectRatio

  return scaleFactor
}
