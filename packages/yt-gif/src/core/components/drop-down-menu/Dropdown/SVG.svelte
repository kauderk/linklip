<script lang="ts">
  export let icon:
    | 'timestamps'
    | 'observer'
    | 'deployment'
    | 'experience'
    | 'playerSettings'
    | 'miscellaneous'
    | 'updates'
    | 'info'
    | 'settings'
    | 'left'
    | 'right'
    | string

  icon = icon.charAt(0).toLowerCase() + icon.slice(1)
  //
</script>

<!-- https://icones.js.org/collection/streamline -->
{#if icon == 'timestamps'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    ><path
      fill="currentColor"
      d="M10 3q-.425 0-.713-.288T9 2q0-.425.288-.713T10 1h4q.425 0 .713.288T15 2q0 .425-.288.713T14 3h-4Zm2 11q.425 0 .713-.288T13 13V9q0-.425-.288-.713T12 8q-.425 0-.713.288T11 9v4q0 .425.288.713T12 14Zm0 8q-1.85 0-3.488-.713T5.65 19.35q-1.225-1.225-1.938-2.863T3 13q0-1.85.713-3.488T5.65 6.65q1.225-1.225 2.863-1.938T12 4q1.55 0 2.975.5t2.675 1.45l.7-.7q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-.7.7Q20 8.6 20.5 10.025T21 13q0 1.85-.713 3.488T18.35 19.35q-1.225 1.225-2.863 1.938T12 22Zm0-2q2.9 0 4.95-2.05T19 13q0-2.9-2.05-4.95T12 6Q9.1 6 7.05 8.05T5 13q0 2.9 2.05 4.95T12 20Zm0-7Z"
    /></svg
  >
{:else if icon == 'observer'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 7.5v5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1h4v7Zm-13-4h13m-3.5 4v-7"
    /></svg
  >
{:else if icon == 'deployment'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><path
        d="M5.5 8.68V5.32c0-.25.23-.4.41-.28l2.45 1.68a.35.35 0 0 1 0 .56L5.91 9c-.18.08-.41-.07-.41-.32Z"
      /><rect width="8" height="11" x="3" y="1.5" rx="1" /><path d="M.5 3v8m13-8v8" /></g
    ></svg
  >
{:else if icon == 'experience'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><circle cx="7" cy="7" r="6.5" /><path
        d="M5.5 4L7 3l1.5 1m-3 6L7 11l1.5-1M10 5.5L11 7l-1 1.5m-6-3L3 7l1 1.5"
      /></g
    ></svg
  >
{:else if icon == 'playerSettings'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><circle cx="2" cy="2" r="1.5" /><path d="M3.5 2h10" /><circle cx="7" cy="7" r="1.5" /><path
        d="M.5 7h5m3 0h5"
      /><circle cx="12" cy="12" r="1.5" /><path d="M10.5 12H.5" /></g
    ></svg
  >
{:else if icon == 'miscellaneous'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><path d="M13.5 1H8m5.5 3H8m5.5 3H8m5.5 6H8m5.5-3H8" /><rect
        width="5"
        height="5"
        x=".5"
        y="1"
        rx=".5"
        transform="rotate(-90 3 3.5)"
      /><rect width="5" height="5" x=".5" y="8" rx=".5" transform="rotate(-90 3 10.5)" /></g
    ></svg
  >
{:else if icon == 'updates'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><path d="M.5 5L3 2.5L5.5 5" /><path
        d="M6 13.5H4a1 1 0 0 1-1-1v-10M13.5 9L11 11.5L8.5 9"
      /><path d="M8 .5h2a1 1 0 0 1 1 1v10" /></g
    ></svg
  >
{:else if icon == 'info'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
      ><circle cx="7" cy="7" r="6.5" /><path d="M7 7v3.5" /><circle cx="7" cy="4.5" r=".5" /></g
    ></svg
  >
{:else if icon == 'settings'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m5.23 2.25l.43-1.11A1 1 0 0 1 6.59.5h.82a1 1 0 0 1 .93.64l.43 1.11l1.46.84l1.18-.18a1 1 0 0 1 1 .49l.4.7a1 1 0 0 1-.08 1.13l-.73.93v1.68l.75.93a1 1 0 0 1 .08 1.13l-.4.7a1 1 0 0 1-1 .49l-1.18-.18l-1.46.84l-.43 1.11a1 1 0 0 1-.93.64h-.84a1 1 0 0 1-.93-.64l-.43-1.11l-1.46-.84l-1.18.18a1 1 0 0 1-1-.49l-.4-.7a1 1 0 0 1 .08-1.13L2 7.84V6.16l-.75-.93a1 1 0 0 1-.08-1.13l.4-.7a1 1 0 0 1 1-.49l1.18.18ZM5 7a2 2 0 1 0 2-2a2 2 0 0 0-2 2Z"
    /></svg
  >
{:else if icon == 'left'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M10.15.5L4 6.65a.48.48 0 0 0 0 .7l6.15 6.15"
    /></svg
  >
{:else if icon == 'right'}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
    ><path
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.85.5L10 6.65a.48.48 0 0 1 0 .7L3.85 13.5"
    /></svg
  >
{/if}
