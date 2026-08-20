import { FEED_PAGE_SIZE, type FeedResponse, type FeedScope, type TopicFeedSort } from './feed'

export type FeedFetch = (cursor: string | null) => Promise<FeedResponse>

export interface FeedSource {
  key: string
  storeId: string
  seed: () => FeedResponse | undefined
  fetch: FeedFetch
  emptyText: string
  guard?: () => boolean
}

const HOME_EMPTY_TEXT: Record<FeedScope, string> = {
  recommend: '还没有可以推荐的内容',
  latest: '还没有图文和文章',
  all: '还没有动态',
  following: '关注的人和话题还没有新动态',
}

export function homeFeedSource(scope: FeedScope, seed: () => FeedResponse | undefined): FeedSource {
  const auth = scope === 'following' ? useAuthStore() : null
  return {
    key: scope,
    storeId: 'feed:stream',
    seed,
    fetch: cursor =>
      hikariRequest('/api/v3/feed', {
        query: { limit: FEED_PAGE_SIZE, scope, ...(cursor ? { cursor } : {}) },
      }),
    emptyText: HOME_EMPTY_TEXT[scope],
    guard: auth ? () => auth.isAuthenticated : undefined,
  }
}

export function topicStoreId(id: number): string {
  return `feed:relation:topic:${id}`
}

export function sectionStoreId(id: number): string {
  return `feed:relation:section:${id}`
}

// 同一话题一个 store,sort 即桶 key:latest 桶由 BFF 首屏 seed,hot 桶切到该 tab 时按需拉取。
export function topicFeedSource(
  id: number,
  seed: () => FeedResponse | undefined,
  sort: TopicFeedSort = 'latest',
): FeedSource {
  return {
    key: sort,
    storeId: topicStoreId(id),
    seed,
    fetch: cursor =>
      hikariRequest('/api/v3/topics/{id}/feed', {
        path: { id },
        query: { limit: FEED_PAGE_SIZE, sort, ...(cursor ? { cursor } : {}) },
      }),
    emptyText: '这个话题下还没有内容',
  }
}

export function sectionFeedSource(id: number, seed: () => FeedResponse | undefined): FeedSource {
  return {
    key: 'main',
    storeId: sectionStoreId(id),
    seed,
    fetch: cursor =>
      hikariRequest('/api/v3/sections/{id}/feed', {
        path: { id },
        query: { limit: FEED_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
      }),
    emptyText: '这个板块下还没有内容',
  }
}
