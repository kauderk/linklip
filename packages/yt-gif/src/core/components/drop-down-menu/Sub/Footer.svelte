<script lang="ts">
  import Tutorials from '../../drop-down-menu/miscellaneous/Tutorials.svelte'
  import Separator from '../Basic/Separator.svelte'

  import type { SelectOptionsProxy } from '$v3/init/config/UIStore/types'

  export let tutOptions: SelectOptionsProxy
</script>

<slot />
<Separator />
<span class="my-1" />
<Tutorials props={tutOptions} />
