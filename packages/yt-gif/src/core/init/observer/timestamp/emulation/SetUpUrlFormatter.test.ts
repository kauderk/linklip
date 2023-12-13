// @vitest-environment jsdom
import { createUrlButtonFormatter } from '$v3/components/yt-gif/controls/dropdown/model/url-button/formatters'
import { YTGIF_Config } from '$v3/lib/types/config'
import notionSingleBlocks from './notionSingleBlocks.json'

test('format url to yt-gif', async () => {
  ;(await import('$lib/global/window')).assignToPrototype()

  const dom = document.createElement('div')
  // you should update this on every test run because the block might change on notions end
  dom.innerHTML = notionSingleBlocks[0].html

  debugger
  const model = createUrlButtonFormatter({
    target: dom.querySelector('.notion-link-token') as HTMLElement,
    message: 'vitest',
    targetClass: 'notion-link-token',
  })

  const response = await model.sub['ytgif'].action()
  if (response) {
    if (!YTGIF_Config.guardClause(response.url)) {
      throw new Error(response.url)
    }
  }
})
