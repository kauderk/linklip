<script lang="ts">
  export let icon:
    | 'play'
    | 'pause'
    | 'high'
    | 'low'
    | 'muted'
    | 'captions'
    | 'mini'
    | 'tall'
    | 'wide'
    | 'open'
    | 'close'
    | 'drag'
    | 'x'
    | 'maximize'
    | 'logo-idle'
    | '' = ''
</script>

{#if icon == 'play'}
  <svg class="play-icon" viewBox="0 0 24 24">
    <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
  </svg>
{:else if icon == 'pause'}
  <svg class="pause-icon" viewBox="0 0 24 24">
    <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
  </svg>
{:else if icon == 'high'}
  <svg class="volume-high-icon" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
    />
  </svg>
{:else if icon == 'low'}
  <svg class="volume-low-icon" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
    />
  </svg>
{:else if icon == 'muted'}
  <svg class="volume-muted-icon" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
    />
  </svg>
{:else if icon == 'captions'}
  <svg viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z"
    />
  </svg>
{:else if icon == 'mini'}
  <svg viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
    />
  </svg>
{:else if icon == 'tall'}
  <svg class="tall" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
    />
  </svg>
{:else if icon == 'wide'}
  <svg class="wide" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
    />
  </svg>
{:else if icon == 'open'}
  <svg class="open" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
    />
  </svg>
{:else if icon == 'close'}
  <svg class="close" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
    />
  </svg>
{:else if icon == 'drag'}
  <svg class="drag" viewBox="0 0 24 24">
    <path
      stroke-width="2"
      stroke="currentColor"
      stroke-linecap="square"
      d="M8 8h8v8h-8zM4 4v.01M8 4v.01M12 4v.01M16 4v.01M20 4v.01M4 20v.01M8 20v.01M12 20v.01M16 20v.01M20 20v.01M20 16v.01M20 12v.01M20 8v.01M4 16v.01M4 12v.01M4 8v.01"
    />
  </svg>
{:else if icon == 'x'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="x"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
{:else if icon == 'maximize'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="maximize"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    fill="none"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 16m0 1a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1z" />
    <path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-6" />
    <path d="M12 8h4v4" />
    <path d="M16 8l-5 5" />
  </svg>
{:else if icon == 'logo-idle'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke-width="1.4"
    stroke="currentColor"
    fill="none"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path
      d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"
    />
    <path d="M10 9v6l5 -3z" />
  </svg>
{/if}
