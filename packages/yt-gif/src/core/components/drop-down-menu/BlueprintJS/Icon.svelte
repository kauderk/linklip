<script>
  export let focus = true
  export let icon = 'more'
</script>

<span
  class="bp3-button bp3-minimal bp3-small bp3-icon-{icon}"
  class:dont-focus-block={focus}
  tabindex="-1"
/>
