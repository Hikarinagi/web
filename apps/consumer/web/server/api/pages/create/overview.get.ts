import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const mine = {
    mine: true,
    status: ['DRAFT' as const, 'ACTIVE' as const, 'REVIEW' as const],
    page: 1,
    page_size: 5,
  }
  const review = { status: ['REVIEW' as const], page: 1, page_size: 1 }
  const [edits, watched, unpatrolled, novelQueue, mangaQueue, novels, mangas] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/wiki/edits', {
      query: { page: 1, page_size: 5, state: 'applied' },
    }),
    fetchBackendData(event, '/api/v3/user/me/wiki/watchlist', {
      query: { page: 1, page_size: 5 },
    }),
    fetchBackendData(event, '/api/v3/wiki/changes', {
      query: { unpatrolled: true, page: 1, page_size: 1 },
    }),
    fetchBackendData(event, '/api/v3/novel-projects', { query: review }),
    fetchBackendData(event, '/api/v3/manga-projects', { query: review }),
    fetchBackendData(event, '/api/v3/novel-projects', { query: mine }),
    fetchBackendData(event, '/api/v3/manga-projects', { query: mine }),
  ])

  return {
    edits,
    watched,
    review_counts: {
      unpatrolled: unpatrolled.meta.total_items,
      novel_projects: novelQueue.meta.total_items,
      manga_projects: mangaQueue.meta.total_items,
    },
    novels: novels.items,
    mangas: mangas.items,
  }
}

export type CreatorOverviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
