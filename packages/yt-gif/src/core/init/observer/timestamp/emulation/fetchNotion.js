var window = typeof window === 'undefined' ? {} : window

var blockString = async block_id => {
  // return notion.blocks.retrieve({ block_id }).then(res => res as ParagraphBlockObjectResponse)
  return proxyNotion({
    ['blocks.retrieve']: {
      block_id,
    },
  })
}

function proxyNotion(query) {
  let stringify = stringifyQuery(query)
  let post = new URLSearchParams(stringify).toString()
  return fetch(`https://yt-gif-middleware-kauderk.vercel.app/notion?${post}`)
    .then(res => res.json())
    .then(res => {
      res.fetch_path = Object.keys(query)[0]
      // @ts-expect-error
      window.log = [...(window.log ?? []), res]
      console.log(res)
      return res
    })
}
function stringifyQuery(query) {
  const copy = structuredClone(query)
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'object') copy[key] = JSON.stringify(copy[key])
  }
  return copy
}

async function main() {
  let testSingleBlockIds =
    // [...$0.querySelectorAll('[data-block-id]')].filter(b=>b.querySelector('.notranslate').innerHTML).map(b=>b.dataset.blockId);
    [
      '809927ba-f876-4076-b9bb-093659ae4953',
      'c818d248-6c82-44a0-9062-dd6180ac6530',
      'fb2c15f8-f050-4e28-9980-bab65ba608be',
      'afc3d9ef-2858-4563-9437-035dfa766e5d',
      'a62b84fa-dc80-4423-a6e1-144be1823ccc',
      '409e96d0-5bdf-4d8a-b756-afe81b6ba1e6',
      '91782b3e-719f-4a0a-bfc0-bd3e7d25548a',
      'e94ffdb6-667e-47e6-8cca-f14834dca701',
      '6751e85f-4a96-405b-b80d-f61b77072e62',
    ]
  let resStack = []
  console.log('testSingleBlockIds', testSingleBlockIds)
  debugger
  for (let id of testSingleBlockIds) {
    resStack.push(await blockString(id))
  }
  console.log(resStack)
  console.log(JSON.stringify(resStack))
  return resStack
}

main()
  .then(console.log)
  .catch(e => {
    debugger
  })
