// import { onLoad } from 'src/shared/messages'
import './xframe_ignore'

console.info('linklip background script')

// chrome.webNavigation.onCompleted.addListener(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     if (!tabs[0]?.id) return

//     chrome.tabs.sendMessage(tabs[0].id, { background: true }, f => {
//       console.log('background Script! received', f)
//       debugger
//     })
//   })
// })

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(onLoad('background Script'), { request: message, sender, sendResponse })
//   debugger
//   sendResponse(message)
// })

export {}
