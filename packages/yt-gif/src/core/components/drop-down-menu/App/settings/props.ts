import { toggleRoamResearchSidebar_YtGifSettingsPage } from '$v3/init/dom/sidebar'
import { writable } from 'svelte/store'
export const menu = <const>{
  name: 'Settings',
  'data-tooltip': 'yt-gif settings',
}
export const themeStore = writable<'dark' | 'light'>('dark')
export const theme = <const>{
  name: 'Toggle Theme',
  icon: 'contrast',
  tooltip: 'Theme: Dark - or - Light',
  change(e: MouseEvent) {
    const dark = (e.currentTarget as HTMLElement)?.closest?.('.bp3-dark')
    themeStore.set(!dark ? 'dark' : 'light')
  },
  customization: {
    on: 'gear',
    tooltip: 'Customization',
    type: 'check',
  },
}
export const toggles = <const>{
  question: {
    name: 'Frequently Asked Questions',
    icon: 'help',
    tooltip: 'Frequently Asked Questions - kauderk.github.io/yt-gif-faq',
    change: () =>
      window
        .open('https://github.com/kauderk/kauderk.github.io/tree/main/yt-gif-extension/install/faq')
        ?.focus(),
  },
  sidebar: {
    name: 'Settings Page',
    icon: 'menu-closed',
    tooltip: "YT GIF Settings page. It's purpose is to check values - change them using this menu.",
    change(e: MouseEvent) {
      toggleRoamResearchSidebar_YtGifSettingsPage({ onOpen: () => {} })
    },
  },
}
