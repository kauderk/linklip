<script lang="ts">
  import type { RangeProxy } from '$v3/init/config/UIStore/types'
  import type { TRange } from '../App/miscellaneous/props'

  export let props: RangeProxy & { range: TRange }

  function updateSlider(e: WheelEvent & { currentTarget: HTMLInputElement }) {
    const scrollElement = e.currentTarget
    const direction = Math.sign(e.deltaY) * -1
    const parsed = parseInt(scrollElement.value, 10)
    scrollElement.value = Number(direction + parsed).toString()
    return { value: scrollElement.value }
  }
  function updateLabel(input: { value: s }) {
    props.change({ value: Number(input.value), debounce: true })
  }
</script>

<div class="ytg-range">
  <input
    type="range"
    {...props.range.attr}
    on:click={e => updateLabel(e.currentTarget)}
    on:wheel={e => updateLabel(updateSlider(e))}
  />
  <label for={props.range.attr.id} {...props.range.counter}>{$props.value}</label>
</div>

<style lang="scss">
  .ytg-range {
    display: flex;
    width: 100%;
    gap: 0.5em;

    * {
      display: block;
      margin: 0;
    }
    input {
      width: 100%;
      cursor: col-resize;
      opacity: 0.8;
    }
    label {
      min-width: 12.8px;
      max-width: 100%;
      text-decoration: none;
      font-weight: normal;
      text-align: center;
    }
  }
</style>
