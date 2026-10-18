import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { groupByBatch } from '../../../utils/review-queue'

const CHECK_FILTERS = ['disputed', 'running'] as const

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const check = CHECK_FILTERS.find(value => value === rawQuery.check)
  const total = (query: { status?: 'PENDING'; check?: (typeof CHECK_FILTERS)[number] }) =>
    fetchBackendData(event, '/api/v3/change-requests', {
      query: { ...query, page: 1, page_size: 1 },
    }).then(result => result.meta.total_items)
  const [pending, all, disputed, running] = await Promise.all([
    fetchBackendData(event, '/api/v3/change-requests', {
      query: {
        ...(check === 'disputed' ? {} : { status: 'PENDING' as const }),
        ...(check ? { check } : {}),
        page: Number(rawQuery.page) || 1,
        page_size: Number(rawQuery.page_size) || 20,
      },
    }),
    total({ status: 'PENDING' }),
    total({ check: 'disputed' }),
    total({ status: 'PENDING', check: 'running' }),
  ])

  return {
    pending: { meta: pending.meta, items: groupByBatch(pending.items) },
    counts: { all, disputed, running },
  }
}

export type CreatorReviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
