import type { BackendChangeRequestSummary } from '~/features/creator/contribution'
import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const me = await fetchBackendData(event, '/api/v3/user/me')
  const contributions = await fetchBackendData(event, '/api/v3/change-requests', {
    query: {
      author_id: me.id,
      page: Number(rawQuery.page) || 1,
      page_size: Number(rawQuery.page_size) || 20,
      status:
        typeof rawQuery.status === 'string'
          ? (rawQuery.status as BackendChangeRequestSummary['status'])
          : undefined,
    },
  })

  return { contributions }
}

export type CreatorContributionsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
