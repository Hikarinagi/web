import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { groupByBatch } from '../../../utils/review-queue'

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const pending = await fetchBackendData(event, '/api/v3/change-requests', {
    query: {
      status: 'PENDING',
      page: Number(rawQuery.page) || 1,
      page_size: Number(rawQuery.page_size) || 20,
    },
  })

  return { pending: { meta: pending.meta, items: groupByBatch(pending.items) } }
}

export type CreatorReviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
