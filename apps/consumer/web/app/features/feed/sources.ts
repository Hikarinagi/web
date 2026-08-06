import { FEED_PAGE_SIZE, type FeedResponse, type FeedScope } from './feed'

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
  hot: '最近还没有热起来的内容',
  recommend: '还没有动态',
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

export function topicFeedSource(id: number, seed: () => FeedResponse | undefined): FeedSource {
  return {
    key: 'main',
    storeId: topicStoreId(id),
    seed,
    fetch: cursor =>
      hikariRequest('/api/v3/topics/{id}/feed', {
        path: { id },
        query: { limit: FEED_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
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
