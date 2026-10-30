import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const page = Number(getQuery(event).page) || 1
  const notices = await fetchBackendData(event, '/api/v3/wiki/notices', {
    query: { page, page_size: 30 },
  })
  return { notices }
}

export type CreatorNoticesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
