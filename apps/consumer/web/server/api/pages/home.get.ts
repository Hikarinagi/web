import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { FEED_PAGE_SIZE, type FeedScope } from '~/features/feed/feed'
import { fetchBackendData } from '../../utils/backend-api'
import { loadFeedSidebar } from '../../features/feed/sidebar'
import { definePageBffHandler } from '../../utils/page-bff'

const SEEDABLE_SCOPES: FeedScope[] = ['recommend', 'latest', 'all']

async function handler(event: H3Event) {
  const raw = getQuery(event).tab
  const requested = Array.isArray(raw) ? raw[0] : raw
  const scope = SEEDABLE_SCOPES.find(item => item === requested) ?? 'all'

  const [feed, sidebar] = await Promise.all([
    fetchBackendData(event, '/api/v3/feed', {
      query: { limit: FEED_PAGE_SIZE, scope },
    }),
    loadFeedSidebar(event),
  ])
  return { scope, feed, sidebar }
}

export type HomePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
