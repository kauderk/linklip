<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Separator from '$v3/components/drop-down-menu//Basic/Separator.svelte'
  import MultipleOptions from '$v3/components/drop-down-menu//Sub/MultipleOptions.svelte'
  import Tutorials from '$v3/components/drop-down-menu/miscellaneous/Tutorials.svelte'
  import {
    play_style,
    mute_style,
    fullscreen_style,
    url_boundaries,
    url_volume,
    player_settings_options,
    player_settings_tutorials,
  } from './store'
  import SelectLabel from '$v3/components/drop-down-menu/Select/SelectLabel.svelte'
</script>

<Tutorials props={player_settings_tutorials} />

<SelectLabel options={play_style} />
<SelectLabel options={mute_style} />
<SelectLabel options={fullscreen_style} />

<Separator />
<SelectLabel options={url_boundaries} />
<SelectLabel options={url_volume} />

<Separator class="mb-2" />
<div class="w-full">
  <MultipleOptions props={player_settings_options} />
</div>
<span class="mb-2" />
