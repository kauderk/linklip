<script lang="ts">
  import { high as storyboard } from '$mock/storyboard.json'

  function getFrameCoordinates(percentage: number, direction: -1 | 1 = 1) {
    const totalThumbnails = storyboard.slot.thumbnailCount
    const thumbnailIndex = Math.floor(percentage * totalThumbnails)

    const { frames } = storyboard
    let maxThumbnailCount = 0
    let frameIndex = 0
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]
      maxThumbnailCount += frame.thumbnailCount
      if (thumbnailIndex < maxThumbnailCount) {
        frameIndex = i
        break
      }
    }

    const frame = frames[frameIndex]
    const relativeThumbnailIndex = thumbnailIndex - maxThumbnailCount + frame.thumbnailCount

    const row = Math.floor(relativeThumbnailIndex / storyboard.slot.rows)
    direction *= -1
    const col = relativeThumbnailIndex % storyboard.slot.columns

    return {
      ...frame,
      xCord: col * storyboard.slot.thumbnailWidth * direction,
      yCord: row * storyboard.slot.thumbnailHeight * -1,
    }
  }

  export let percentage = 0
  export let count = 0
  export let tiles = 1
  export let scale = 1
  $: thumb = getFrameCoordinates(
    percentage || ((count / storyboard.slot.thumbnailCount) * 100) / 100
  )
</script>

<div
  class="storyboard"
  style:background-image="url('{thumb.url}')"
  style:background-size="{thumb.width * scale}px {thumb.height * scale}px"
  style:background-repeat="no-repeat"
  style:background-position-x="{thumb.xCord * scale}px"
  style:background-position-y="{thumb.yCord * scale}px"
  style:height="{storyboard.slot.thumbnailHeight * scale}px"
  style:width="{storyboard.slot.thumbnailWidth * tiles * scale}px"
/>

<style>
  .storyboard {
    box-shadow: inset 0 -13px 13px -13px black, inset 0 13px 13px -13px black;
  }
</style>
