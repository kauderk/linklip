<script lang="ts" context="module">
  import { contextMenuSchema } from './ContextMenuSchema'
  import type { ContextMenuSchema, ContextMenuSchemaActionNode } from './types'
  let menu = preSignal(() => ({
    x: 0,
    y: 0,
  }))
  let open = preSignal(false)
  let contain$ = computed(() => contextMenuSchema.value.container)
  export type { ContextMenuSchemaActionNode as Schema } from './types'

  export function useContextMenu(event: MouseEvent, schema: ContextMenuSchema, overlay?: boolean) {
    event.stopPropagation()
    event.preventDefault()
    contextMenuSchema.set(schema)
    if (overlay) {
      ;(event.target as any)
        ?.closest('.context-menu-boundary')
        ?.classList.add('context-menu-overlay')
    }
    openContextMenu(event)
  }
  function openContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement
    open.value = false

    const contain = contain$.peek()
    if (!!contain && target !== contain && !Array.from(contain.children).includes(target)) {
      return
    }

    event.preventDefault()
    open.value = true

    const offsetX = event.offsetX
    const offsetY = event.offsetY
    menu.set(() => {
      const rect = target.getBoundingClientRect()
      return {
        x: rect.left + rect.width * (offsetX / rect.width),
        y: rect.top + rect.height * (offsetY / rect.height),
      }
    })
  }
  function update(menuRef: HTMLElement) {
    const fRect = menu.peek()()
    menuRef.style.setProperty('--x', fRect.x + 'px')
    menuRef.style.setProperty('--y', fRect.y + 'px')
  }
  function adjustRect(menuRef: HTMLElement) {
    return {
      destroy: updateWindow(() => update(menuRef), 600, true),
    }
  }
  function handle_click_outside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.classList.contains('context-menu')) {
      open.value = false
    }
  }
</script>

<script lang="ts">
  import { ignoreCssRules, tsAny } from '$lib/no-invalidate'
  import { preSignal, type PreSignal } from '$lib/pre-signal'
  import { updateWindow } from '$lib/resize'
  import { cleanSubscribers } from '$lib/stores'
  import { computed } from '@preact/signals-core'
  import { onMount } from 'svelte'
  import Template, { defineTemplate } from '../template/Template.svelte'
  import Show from './Show.svelte'
  let template = defineTemplate<{
    item: ContextMenuSchemaActionNode
    open: PreSignal<boolean | undefined>
  }>()
  onMount(() =>
    cleanSubscribers(
      open.subscribe($open => {
        if ($open) return
        document
          .querySelectorAll('.context-menu-overlay')
          .forEach(e => e.classList.remove('context-menu-overlay'))
      }),
      // @ts-expect-error undefined
      menu.set
    )
  )
</script>

<svelte:window
  on:mousedown={handle_click_outside}
  on:beforeprint={() => {
    setTimeout(() => (open.value = false), 300)
  }}
/>

<Template bind:template let:props>
  <!-- prettier-ignore -->
  <li class="action" class:hover={props.item.hover} on:mouseleave={e=>e.currentTarget.classList.remove('hover')}>
		<button
			on:click={() => {
				// @ts-expect-error undefined
				props.item.callback(props.open)
			}}
			>{props.item.content}</button
		>
	</li>
</Template>

{#if $open}
  <div class="context-menu" use:adjustRect>
    <ul>
      {#each $contextMenuSchema.nodes as item}
        {#if 'children' in item}
          {@const open = preSignal(tsAny(item.open))}
          <li
            class="action"
            {...ignoreCssRules}
            on:mouseenter={() => open.set(true)}
            on:mouseleave={() => open.set(false)}
          >
            {item.content + '>'}
            <Show when={open}>
              <ul class="sub-actions">
                {#each item.children as child}
                  <!-- prettier-ignore -->
                  <svelte:component this={template} {open} item={child} />
                {/each}
              </ul>
            </Show>
          </li>
        {:else}
          <svelte:component this={template} {open} {item} />
        {/if}
      {/each}
    </ul>
  </div>
{/if}

<style lang="scss">
  .context-menu {
    --p: 5px;
    --font-size: 1rem;
    --outline: 1px solid gray;
    --bg-h: lightgray;
    --bg: white;

    width: max-content;
    height: auto;

    box-shadow: 0px 0px 15px #163a6726;
    z-index: 102;
    font-family: sans-serif;
    color: black;

    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &,
    ul.sub-actions {
      position: absolute;
      background: var(--bg);
      outline: var(--outline);
      border-radius: var(--p);
      padding: var(--p);
      top: var(--y);
      left: var(--x);
    }

    ul.sub-actions {
      --y: calc(var(--p) * -1);
      --x: 100%;
    }

    li.action {
      padding: var(--p);
      position: relative;
      &.hover,
      &:hover {
        cursor: pointer;
        background: var(--bg-h);
      }
      &,
      button {
        font-size: var(--font-size);
        border-radius: var(--p);
      }
      button {
        white-space: nowrap;
      }
    }
  }
  :global(.context-menu-overlay::after) {
    content: '';
    display: block;
    width: inherit;
    height: 100%;
    z-index: 11;
    background: #1e1e1e85;
    position: absolute;
    filter: blur(30px);
  }
</style>
