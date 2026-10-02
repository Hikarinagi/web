import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { readIdParam, readPageQuery } from '#shared/utils/query'

export function readPage(event: H3Event, key = 'page'): number {
  return readPageQuery(getQuery(event), key)
}

export function readId(event: H3Event, key = 'id'): number {
  const id = readIdParam(getRouterParam(event, key))
  if (id === null) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return id
}
