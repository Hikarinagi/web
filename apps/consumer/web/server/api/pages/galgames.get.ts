import { getCookie, type H3Event } from 'h3'
import { VISITOR_COOKIE, VISITOR_PATTERN } from '#shared/utils/visitor'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

async function handler(event: H3Event) {
  const visitor = getCookie(event, VISITOR_COOKIE)
  const [landing, banners] = await Promise.all([
    fetchBackendData(event, '/api/v3/landing/galgames', {
      query: visitor && VISITOR_PATTERN.test(visitor) ? { visitor } : {},
    }),
    fetchBackendData(event, '/api/v3/promotions/banners', {
      query: { surface: 'GALGAME_FEED' },
    }).catch(() => []),
  ])
  return { ...landing, banners }
}

export type GalgamesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
