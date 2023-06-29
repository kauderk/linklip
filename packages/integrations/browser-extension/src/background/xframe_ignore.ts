// https://github.com/guilryder/chrome-extensions/tree/main/xframe_ignore
// https://github.com/MartinWie/Framer/blob/main/removeHeader.json
// https://chrome.google.com/webstore/detail/ignore-x-frame-options
// @ts-nocheck

chrome.declarativeNetRequest.updateSessionRules(
  {
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'x-frame-options',
              operation: 'remove',
            },
            {
              header: 'content-security-policy',
              operation: 'remove',
            },
          ],
        },
        condition: {
          urlFilter: `*`,
          resourceTypes: ['main_frame', 'sub_frame'],
        },
      },
    ],
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
    }
  }
)

export {}
