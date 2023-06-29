<script lang="ts" context="module">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  export { menu } from './props'
</script>

<script lang="ts">
  import Tutorials from '$v3/components/drop-down-menu/miscellaneous/Tutorials.svelte'
  import MultipleOptions from '$v3/components/drop-down-menu/Sub/MultipleOptions.svelte'
  import Separator from '$v3/components/drop-down-menu/Basic/Separator.svelte'
  import Button from '../../Sub/Button.svelte'

  import { override_roam_video_component, deploy_tutorials, power, deployReset } from './store'
  import { Subscribe } from 'svelte-subscribe'

  power.updateSubscribers()
</script>

<Tutorials props={deploy_tutorials} />

<MultipleOptions props={override_roam_video_component} />
<Separator class="mt-2" />

<span class="flex items-center gap-3">
  <Subscribe props={deployReset.derived} let:props>
    <span use:tooltipAction={props}>
      <Button
        icon={props.icon}
        selected={$deployReset}
        disabled={!$power.value}
        on:change={e => deployReset.set(e.detail)}>{props.name}</Button
      >
    </span>
  </Subscribe>
  <span use:tooltipAction={power}>
    <Button
      icon={power.icon}
      selected={$power.value}
      on:change={e => power.updateSubscribers(e.detail)}>{power.name}</Button
    >
  </span>
</span>
