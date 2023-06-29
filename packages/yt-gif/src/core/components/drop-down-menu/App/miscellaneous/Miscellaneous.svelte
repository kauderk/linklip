<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Tutorials from '$v3/components/drop-down-menu/miscellaneous/Tutorials.svelte'

  import MultipleOptions from '$v3/components/drop-down-menu/Sub/MultipleOptions.svelte'
  import SelectLabel from '$v3/components/drop-down-menu/Select/SelectLabel.svelte'
  import RangeLabel from '$v3/components/drop-down-menu/Range/RangeLabel.svelte'
  import Separator from '$v3/components/drop-down-menu/Basic/Separator.svelte'

  import {
    yt_playback_speed,
    timestamp_display_scroll_offset,
    end_loop_sound_volume,
    awaiting_input_type,
    fmt_options,
    miscellaneous_tutorials,
  } from './store'

  let hidden: b
</script>

<Tutorials props={miscellaneous_tutorials} />

<MultipleOptions
  props={awaiting_input_type}
  on:option={e => (hidden = !e.detail.selection.includes('simulate_url_formatter'))}
/>
<span class:hidden class="m-2">
  <MultipleOptions props={fmt_options} />
</span>

<Separator class="mt-1" />
<SelectLabel options={yt_playback_speed} />

<Separator />
<RangeLabel props={timestamp_display_scroll_offset} />

<Separator />
<RangeLabel props={end_loop_sound_volume} />
