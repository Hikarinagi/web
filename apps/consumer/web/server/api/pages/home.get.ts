import type { H3Event } from 'h3'
import { FEED_PAGE_SIZE } from '~/features/feed/feed'
import { fetchBackendData } from '../../utils/backend-api'
import { loadFeedSidebar } from '../../features/feed/sidebar'
import { definePageBffHandler } from '../../utils/page-bff'

async function handler(event: H3Event) {
  const [feed, sidebar] = await Promise.all([
    fetchBackendData(event, '/api/v3/feed', {
      query: { limit: FEED_PAGE_SIZE, scope: 'recommend' },
    }),
    loadFeedSidebar(event),
  ])
  return { feed, sidebar }
}

export type HomePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
