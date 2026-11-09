import { getCookie, type H3Event } from 'h3'
import { VISITOR_COOKIE, VISITOR_PATTERN } from '#shared/utils/visitor'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

async function handler(event: H3Event) {
  const visitor = getCookie(event, VISITOR_COOKIE)
  const [landing, shelf, banners] = await Promise.all([
    fetchBackendData(event, '/api/v3/landing/mangas', {
      query: visitor && VISITOR_PATTERN.test(visitor) ? { visitor } : {},
    }),
    fetchBackendData(event, '/api/v3/reader/me/manga/reading', {
      query: { page: 1, page_size: 12, status: 'reading' },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/promotions/banners', {
      query: { surface: 'MANGA_FEED' },
    }).catch(() => []),
  ])
  const updated = new Set(landing.updated.map(item => item.id))
  return {
    ...landing,
    reading: (shelf?.items ?? []).filter(item => !updated.has(item.manga_id)),
    banners,
  }
}

export type MangasPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
