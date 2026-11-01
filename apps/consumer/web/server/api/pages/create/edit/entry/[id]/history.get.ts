import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../../utils/backend-api'
import { historyRowsOf } from '../../../../../../utils/entry-history'
import { definePageBffHandler } from '../../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1
  const [entry, revisions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/revisions', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  return {
    entry: { id: entry.id, type: entry.type, label: entry.label },
    history: historyRowsOf(entry, revisions),
  }
}

export type EntryHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
