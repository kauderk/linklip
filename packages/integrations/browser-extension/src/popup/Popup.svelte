<script lang="ts">
  import Layout from '@packages/yt-gif/src/routes/+layout.svelte'
  import Ytgif from '@packages/yt-gif/src/core/components/yt-gif/App/Tutorial.svelte'

  let grandParentBlock: HTMLElement
  let url: string

  function load(target: HTMLElement) {
    grandParentBlock = target
    url = 'https://youtu.be/vKL7vyiQuns'
  }
</script>

<Layout>
  <div class="container grid place-items-center" use:load>
    {#if url}
      <Ytgif {url} {grandParentBlock} />
    {/if}
  </div>
</Layout>

<style>
  :global(html) {
    width: 340px;
    aspect-ratio: 16 / 9;
  }
</style>
