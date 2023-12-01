import type { DeepPartial } from '$lib/types/utilities'
import { mergeDeep } from '$lib/utils'
import type { ParagraphBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'


/**
 * Blocks where the a block is referenced by a unique id
 */
export const ReferenceBlockSelector = '.notion-transclusion_reference-block[data-block-id]'

export const updateBlock = async <T extends object>(block: T, partial: DeepPartial<T>) => {
  const copy = JSON.parse(JSON.stringify(block))
  const merge = mergeDeep(copy, partial)
  const payload = Object.keys(partial).reduce((acc, key) => {
    acc[key] = merge[key]
    return acc
  }, {} as any)

  return proxyNotion<ParagraphBlockObjectResponse>({
    ['blocks.update']: payload,
  })
}

export const blockString = async (block_id: string) => {
  // return notion.blocks.retrieve({ block_id }).then(res => res as ParagraphBlockObjectResponse)
  return proxyNotion<ParagraphBlockObjectResponse>({
    ['blocks.retrieve']: {
      block_id,
    },
  })
}

function proxyNotion<T>(query: any) {
  let stringify = stringifyQuery(query)
  let post = new URLSearchParams(stringify).toString()
  return fetch(`https://yt-gif-middleware-kauderk.vercel.app/notion?${post}`)
    .then(res => res.json())
    .then(res => {
      res.fetch_path = Object.keys(query)[0]
      debugger
      // @ts-expect-error
      window.log = [...(window.log ?? []), res]
      console.log(res)
      return res as T
    })
}
function stringifyQuery(query: any) {
  const copy = structuredClone(query)
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'object') copy[key] = JSON.stringify(copy[key])
  }
  return copy
}
