import { Client } from '@notionhq/client'
import type { RequestHandler } from './$types'
import { SECRET_NOTION_AUTH } from '$env/static/private'
import { patchFetch, type Patch, json } from './fetch'

type TQuery = {
  path: string[]
  payload: any
}
export const GET = async <P extends params>(req: { query: TQuery }) => {
  const notion = new Client({ auth: SECRET_NOTION_AUTH })

  // the query is JSON stringified in the URL, with the following shape
  // decode it to call the appropriate function like:
  // const response = await notion.blocks.retrieve({
  //   block_id: 'blockId',
  // });
  const query = querySpread(req) as TQuery
  const path = query.path
  // find the caller by recursively calling the path
  const caller = path.reduce((acc, curr) => acc?.[curr], notion as any)
  if (typeof caller !== 'function') {
    throw new Response('Not Found', { status: 404 })
  }
  // call the caller with the payload
  const response = await caller(query.payload)
  return json(response as { hello: 'world' })
}

type params = string[]
export const _GET = async <R extends params, P extends Patch>(query: TQuery) => {
  return patchFetch<RequestHandler, P, ReturnType<typeof GET<R>>>({
    endpoint: 'notion',
    query,
  })
}
//* uncomment me
_GET({
  path: ['blocks', 'retrieve'],
  payload: {},
}).then(response => {
  response
  //^?
})
// */

function isObject(str: string) {
  return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))
}

function querySpread<T, B extends boolean>(event: T, formatTypes?: B) {
  let obj: Record<any, any> = {}
  for (const [key, value] of (event as any).url.searchParams.entries())
    obj[key] =
      formatTypes === undefined || formatTypes === true || formatTypes === null
        ? determine(value)
        : value
  return obj as any
}

function determine(value: string) {
  if (value === 'undefined') return undefined
  if (value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (isObject(value)) return JSON.parse(value)
  if (!Number.isNaN(Number(value))) return Number(value)
  if (value.match(/^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"$/))
    return new Date(value.replace(/^"|"$/g, ''))
  if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) return new Date(value)
  return value
}
