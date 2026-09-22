import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const [status, cards] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/check-ins/status'),
    fetchBackendData(event, '/api/v3/user/me/check-ins/make-up-cards'),
  ])

  return {
    points: status.points,
    make_up_card: {
      ...status.make_up.card,
      window_days: status.make_up.window_days,
      items: cards.items,
    },
  }
}

export type ItemsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
