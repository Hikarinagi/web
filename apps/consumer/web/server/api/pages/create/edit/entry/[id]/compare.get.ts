import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const from = Number(query.from)
  const to = Number(query.to)
  const [entry, comparison, definitions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/comparison', {
      path: { id },
      query: { from, to },
    }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
  ])
  return {
    entry: { id: entry.id, type: entry.type, label: entry.label },
    comparison,
    definitions,
  }
}

export type EntryComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
