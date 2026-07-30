import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const [applications, candidates] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/review-group-applications', {
      query: {
        page: Number(rawQuery.page) || 1,
        page_size: Number(rawQuery.page_size) || 20,
      },
    }),
    fetchBackendData(event, '/api/v3/user/me/review-group-applications/groups'),
  ])
  return { applications, candidates }
}

export type CreatorMembershipPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
