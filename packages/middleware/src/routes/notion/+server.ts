import { Client } from '@notionhq/client'
import type { RequestHandler } from './$types'
import { SECRET_NOTION_AUTH } from '$env/static/private'
import { patchFetch, type Patch, json } from './fetch'
import { querySpread, type Path, type PathValue } from './utils'
import { getProperty } from './dot-prop'

const notion = new Client({ auth: SECRET_NOTION_AUTH })
// filter out the paths that are not functions
type allPaths = Path<typeof notion>
type PrePick = {
  [key in allPaths]: PathValue<typeof notion, key> extends (...args: infer R) => any
    ? R[1] extends undefined
      ? R[0]
      : R
    : never
}
type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }
type Fn = OmitNever<PrePick>
type Functions = Union<Fn>
export type Union<T> = {
  [K in keyof T]: {
    // instead of any, infer the type
    [K2 in K]: T[K2]
  }
}[keyof T]

export const GET = async <Evt extends { query: Functions }>(req: Evt) => {
  // the query is JSON stringified in the URL, with the following shape
  // decode it to call the appropriate function like:
  // const response = await notion.blocks.retrieve({
  //   block_id: 'blockId',
  // });
  const query = querySpread(req) as Functions

  // find the caller by recursively calling the path
  const [path, payload] = Object.entries(query)[0]
  const caller = getProperty(notion, path, undefined)
  if (typeof caller !== 'function') {
    throw new Response('Not Found', { status: 404 })
  }
  // cast the caller to the appropriate type
  // call the caller with the payload
  const response = await caller(payload)
  return json(
    response as Awaited<ReturnType<PathValue<typeof notion, keyof Evt['query'] & keyof Fn>>>
  )
}

export const _GET = async <Q extends Functions, P extends Patch>(query: Q /*& P */) => {
  return patchFetch<RequestHandler, P, ReturnType<typeof GET<{ query: Q }>>>({
    endpoint: 'notion',
    query,
  })
}
/* uncomment me
_GET({
  search: { start_cursor: 'string' },
  // manual: true,
}).then(response => {
  response
  //^?
})
// */
