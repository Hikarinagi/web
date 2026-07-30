import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { groupByBatch } from '../../../utils/review-queue'

async function handler(event: H3Event) {
  const me = await fetchBackendData(event, '/api/v3/user/me')
  const [stats, pending, activity, reviewQueue] = await Promise.all([
    fetchBackendData(event, '/api/v3/contribution/stats', { query: { days: 365 } }),
    fetchBackendData(event, '/api/v3/change-requests', {
      query: { author_id: me.id, status: 'PENDING', page: 1, page_size: 5 },
    }),
    fetchBackendData(event, '/api/v3/contribution/activity', {
      query: { page: 1, page_size: 12 },
    }),
    fetchBackendData(event, '/api/v3/change-requests', {
      query: { status: 'PENDING', page: 1, page_size: 20 },
    }),
  ])

  const review_entries = groupByBatch(
    reviewQueue.items.filter(item => item.author.id !== me.id),
  ).slice(0, 5)

  return { stats, pending, activity: activity.items, review_entries }
}

export type CreatorOverviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
