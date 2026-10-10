import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const [status, cards, download_card, ai_credits] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/check-ins/status'),
    fetchBackendData(event, '/api/v3/user/me/check-ins/make-up-cards'),
    fetchBackendData(event, '/api/v3/user/me/download/cards'),
    fetchBackendData(event, '/api/v3/user/me/ai-credits'),
  ])

  return {
    points: status.points,
    download_card,
    ai_credits,
    make_up_card: {
      ...status.make_up.card,
      window_days: status.make_up.window_days,
      items: cards.items,
    },
  }
}

export type ItemsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
