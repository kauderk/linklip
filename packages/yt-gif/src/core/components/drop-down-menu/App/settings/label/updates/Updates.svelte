<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Sub from '$v3/components/drop-down-menu/Sub/Footer.svelte'
  import BigLabel from '$v3/components/drop-down-menu/miscellaneous/BigLabel.svelte'
  import { updates_tutorials } from '../store'
</script>

<Sub tutOptions={updates_tutorials}>
  <BigLabel>YT GIF Extension v2</BigLabel>
</Sub>
