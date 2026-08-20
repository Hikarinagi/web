import type { H3Event } from 'h3'
import { fetchBackendData } from '../../utils/backend-api'

export async function loadFeedSidebar(event: H3Event) {
  const [me, hot] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me').catch(() => null),
    fetchBackendData(event, '/api/v3/topics', { query: { page: 1, page_size: 5 } }).catch(
      () => null,
    ),
  ])
  const hotTopics = hot?.items ?? []

  if (!me) {
    return { authenticated: false as const, hot_topics: hotTopics }
  }

  const [going, topics, suggestions] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/rates', {
      query: { status: 'GOING', page: 1, page_size: 6 },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/topics', {
      query: { page: 1, page_size: 8 },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/suggestions', {
      query: { page: 1, page_size: 3 },
    }).catch(() => null),
  ])

  return {
    authenticated: true as const,
    going: { items: going?.items ?? [], total: going?.meta.total_items ?? 0 },
    followed_topics: { items: topics?.items ?? [], total: topics?.meta.total_items ?? 0 },
    hot_topics: hotTopics,
    suggestions: suggestions?.items ?? [],
  }
}

export type FeedSidebarData = Awaited<ReturnType<typeof loadFeedSidebar>>
