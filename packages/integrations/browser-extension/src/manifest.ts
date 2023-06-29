import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'linklip',
  description: '',
  version: '0.0.0',
  manifest_version: 3,
  icons: {
    '16': 'img/logo-16.png',
    '32': 'img/logo-34.png',
    '48': 'img/logo-48.png',
    '128': 'img/logo-128.png',
  },
  content_scripts: [
    {
      matches: ['https://www.notion.so/*'],
      js: ['src/content/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['src/shared/widgetapi.js'],
      matches: ['https://www.notion.so/*'],
    },
  ],
  minimum_chrome_version: '10.0',
  host_permissions: ['<all_urls>'],
  permissions: ['webNavigation', 'declarativeNetRequest'],
})
