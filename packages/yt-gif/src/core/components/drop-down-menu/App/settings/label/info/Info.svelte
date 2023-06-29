<script lang="ts" context="module">
  export { menu } from './props'
</script>

<script lang="ts">
  import Sub from '$v3/components/drop-down-menu/Sub/Footer.svelte'
  import BigLabel from '$v3/components/drop-down-menu/miscellaneous/BigLabel.svelte'
  import { info_tutorials } from '../store'
</script>

<Sub tutOptions={info_tutorials}>
  <BigLabel>💡 Hover over the YT GIFs to enable them.<br />Unmute them and Start Playing.</BigLabel>
  <BigLabel
    >🗲 While hovering out HOLD DOWN any<br />"InAndOutKeys"to keep on playing YT GIFs</BigLabel
  >
</Sub>
