import { getQuery, type H3Event } from 'h3'
import { readChangesQuery } from '~/features/wiki/changes'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const state = readChangesQuery(getQuery(event))
  const query = { page: state.page, page_size: state.page_size }
  const list =
    state.f === 'mine'
      ? await fetchBackendData(event, '/api/v3/user/me/wiki/edits', { query })
      : state.f === 'watched'
        ? await fetchBackendData(event, '/api/v3/user/me/wiki/watchlist', { query })
        : await fetchBackendData(event, '/api/v3/wiki/changes', {
            query: state.f === 'unchecked' ? { ...query, unpatrolled: true } : query,
          })
  return { list, state }
}

export type ChangesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
