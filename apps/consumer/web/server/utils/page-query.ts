import { getQuery, type H3Event } from 'h3'
import { readPageQuery } from '#shared/utils/query'

export function readPage(event: H3Event, key = 'page'): number {
  return readPageQuery(getQuery(event), key)
}
