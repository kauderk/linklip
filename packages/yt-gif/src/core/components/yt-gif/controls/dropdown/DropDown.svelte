<script lang="ts">
  import { tooltipAction } from '$v3/components/drop-down-menu/popovers/tooltip'
  import type { TDropDownActions } from './types'
  import { noTypeCheck } from '$lib/types/svelte'
  import UrlButton from '../../url-button/UrlButton.svelte'

  export let data: TDropDownActions
</script>

<span class="yt-gif-invisible-element yt-gif-btn" use:tooltipAction={{ tooltip: '' }}>
  <span
    {...noTypeCheck({ type: 'checkbox', [`data-${data.drop.type}`]: '' })}
    class="bp3-button bp3-minimal bp3-small m-0 appearance-none bp3-icon-{data.drop.on}"
  >
    <div class="yt-gif-url-btns-wrapper">
      <span class="yt-gif-url-btns vertical yt-gif-max-tooltip">
        <UrlButton sub={data.sub} />
      </span>
    </div>
  </span>
</span>
