import type { H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const query = { page: 1, page_size: 6 }
  const [unchecked, watched, recent] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/changes', { query: { ...query, unpatrolled: true } }),
    fetchBackendData(event, '/api/v3/user/me/wiki/watchlist', { query }),
    fetchBackendData(event, '/api/v3/wiki/changes', { query }),
  ])
  return { unchecked, watched, recent }
}

export type WorkbenchPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
