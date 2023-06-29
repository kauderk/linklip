// @vitest-environment jsdom
import { mock } from '$lib/utils-roam-alpha-api'
import { createUrlButtonFormatter } from '$v3/components/yt-gif/controls/dropdown/model/url-button/formatters'
import { YTGIF_Config } from '$v3/lib/types/config'
import { BlockRegexObj } from '$v3/lib/utils'

test('format url to yt-gif', async () => {
  ;(await import('$lib/global/window')).assignToPrototype()

  const dom = document.createElement('div')
  dom.innerHTML = `<div data-block-id="823fc712-9728-478a-8a3b-c46e353d244c" class="notion-selectable notion-text-block" style="width: 100%; max-width: 1446px; margin-top: 1px; margin-bottom: 1px;"><div style="color: inherit; fill: inherit;"><div style="display: flex;"><div class="notranslate" spellcheck="true" placeholder="Press ‘space’ for AI, ‘/’ for commands…" data-content-editable-leaf="true" style="max-width: 100%; width: 100%; white-space: pre-wrap; word-break: break-word; caret-color: rgba(255, 255, 255, 0.81); padding: 3px 2px;" contenteditable="true"><a href="${mock.url}" style="cursor:pointer;color:inherit;word-wrap:break-word;text-decoration:inherit" class="notion-link-token notion-focusable-token notion-enable-hover" rel="noopener noreferrer" data-token-index="0" tabindex="0"><span style="border-bottom:0.05em solid;border-color:rgba(255, 255, 255, 0.283);opacity:0.7" class="link-annotation-823fc712-9728-478a-8a3b-c46e353d244c--1768189125">${mock.url}</span></a></div></div></div></div>`

  const model = createUrlButtonFormatter({
    target: dom.querySelector('.notion-link-token') as HTMLElement,
    message: 'vitest',
    targetClass: 'notion-link-token',
  })

  const response = await model.sub['startEnd'].action()
  if (response) {
    const regex = BlockRegexObj(YTGIF_Config.componentPage, YTGIF_Config.targetStringRgx)
    if (!response.string.match(regex.componentRgx)?.[0]) {
      throw new Error(response.string)
    }
  }
})
