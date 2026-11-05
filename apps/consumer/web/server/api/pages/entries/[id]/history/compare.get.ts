import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { readPage } from '~/features/wiki/history'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { wikiNames } from '~~/server/utils/wiki-names'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const query = getQuery(event)
  const [from, to] = [readPage(query.from), readPage(query.to)].sort((a, b) => a - b) as [
    number,
    number,
  ]
  const [comparison, entry, definitions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/comparison', {
      path: { id },
      query: { from, to },
    }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
  ])
  return {
    comparison,
    entry: { id: entry.id, type: entry.type, label: entry.label },
    names: wikiNames(definitions, [entry.type]),
  }
}

export type ComparePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
