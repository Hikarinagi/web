import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { groupByBatch } from '../../../utils/review-queue'

const VIEWS = ['disputed', 'running', 'bot'] as const

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const view = VIEWS.find(value => value === rawQuery.view)
  const total = (query: { status?: 'PENDING'; check?: 'disputed' | 'running'; by_bot?: boolean }) =>
    fetchBackendData(event, '/api/v3/change-requests', {
      query: { ...query, page: 1, page_size: 1 },
    }).then(result => result.meta.total_items)
  const [pending, all, disputed, running, bot] = await Promise.all([
    fetchBackendData(event, '/api/v3/change-requests', {
      query: {
        ...(view === 'disputed' ? {} : { status: 'PENDING' as const }),
        ...(view === 'disputed' || view === 'running' ? { check: view } : {}),
        ...(view === 'bot' ? { by_bot: true } : {}),
        page: Number(rawQuery.page) || 1,
        page_size: Number(rawQuery.page_size) || 20,
      },
    }),
    total({ status: 'PENDING' }),
    total({ check: 'disputed' }),
    total({ status: 'PENDING', check: 'running' }),
    total({ status: 'PENDING', by_bot: true }),
  ])

  return {
    pending: { meta: pending.meta, items: groupByBatch(pending.items) },
    counts: { all, disputed, running, bot },
  }
}

export type CreatorReviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
