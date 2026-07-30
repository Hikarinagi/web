import { getRouterParam, type H3Event } from 'h3'
import { FEED_PAGE_SIZE } from '~/features/feed/feed'
import { fetchBackendData } from '../../../utils/backend-api'
import { loadFeedSidebar } from '../../../utils/feed-sidebar'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const [section, feed, sidebar] = await Promise.all([
    fetchBackendData(event, '/api/v3/sections/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/sections/{id}/feed', {
      path: { id },
      query: { limit: FEED_PAGE_SIZE },
    }),
    loadFeedSidebar(event),
  ])
  return { section, feed, sidebar }
}

export type SectionPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
