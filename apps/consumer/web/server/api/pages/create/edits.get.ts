import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

const STATES = ['applied', 'reverted', 'pending'] as const

async function handler(event: H3Event) {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const state = STATES.find(item => item === query.view)
  const edits = state
    ? await fetchBackendData(event, '/api/v3/user/me/wiki/edits', {
        query: { page, page_size: 30, state },
      })
    : await fetchBackendData(event, '/api/v3/user/me/wiki/watchlist', {
        query: { page, page_size: 30 },
      })
  return { edits }
}

export type CreatorEditsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
