import { getRouterParam, type H3Event } from 'h3'
import { FEED_PAGE_SIZE } from '~/features/feed/feed'
import { fetchBackendData } from '../../../utils/backend-api'
import { loadFeedSidebar } from '../../../features/feed/sidebar'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const [topic, feed, sidebar] = await Promise.all([
    fetchBackendData(event, '/api/v3/topics/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/topics/{id}/feed', {
      path: { id },
      query: { limit: FEED_PAGE_SIZE },
    }),
    loadFeedSidebar(event),
  ])
  return { topic, feed, sidebar }
}

export type TopicPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
