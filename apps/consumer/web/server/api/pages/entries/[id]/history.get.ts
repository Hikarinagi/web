import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { readPage } from '~/features/wiki/history'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const page = readPage(getQuery(event).page)
  const [entry, changes] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/changes', {
      query: { within: id, content: true, page, page_size: 30 },
    }),
  ])
  return {
    entry: { id: entry.id, type: entry.type, label: entry.label, revision: entry.revision },
    changes,
  }
}

export type HistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
