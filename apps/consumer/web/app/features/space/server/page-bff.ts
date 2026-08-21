import { getQuery, type H3Event } from 'h3'
import { FEED_PAGE_SIZE, type FeedResponse } from '~/features/feed/feed'
import { readSpaceRouteQuery } from '~/features/space/route'
import {
  MANAGED_CONTENT_PAGE_SIZE,
  SPACE_BOOKSHELF_PAGE_SIZE,
  SPACE_CONTENT_PAGE_SIZE,
  SPACE_CONTRIBUTION_PAGE_SIZE,
  SPACE_FOLLOW_PAGE_SIZE,
  SPACE_RATE_PAGE_SIZE,
  type ManagedContentPage,
  type SpaceBookshelfTabData,
  type SpaceCollectionCard,
  type SpaceCollectionItem,
  type SpaceContentPage,
  type SpaceContributionPage,
  type SpaceFollowPage,
  type SpaceRatePage,
  type SpaceTabKey,
} from '~/features/space/space'
import { topVotedMedia, type HikariImageSource } from '~/utils/media/image'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { readPage } from '~~/server/utils/page-query'

export function readTab(event: H3Event): SpaceTabKey {
  return readSpaceRouteQuery(getQuery(event)).tab
}

export async function fetchShell(event: H3Event, id: number) {
  const [me, profile, statistics, going] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me').catch(() => null),
    fetchBackendData(event, '/api/v3/user/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/user/{id}/statistics', { path: { id } }),
    fetchBackendData(event, '/api/v3/user/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 8, status: 'GOING' },
    }),
  ])

  const is_self = me?.id === id
  const status = is_self
    ? await fetchBackendData(event, '/api/v3/user/me/status').catch(() => null)
    : null

  return { is_self, profile, statistics, going, status }
}

export async function fetchTab(event: H3Event, id: number, tab: SpaceTabKey, is_self: boolean) {
  const page = readPage(event)
  const tabData: {
    feed: FeedResponse | null
    contents: SpaceContentPage | null
    managed: ManagedContentPage | null
    rates: SpaceRatePage | null
    collections: SpaceCollectionCard[] | null
    contributions: SpaceContributionPage | null
    following: SpaceFollowPage | null
    followers: SpaceFollowPage | null
    bookshelf: SpaceBookshelfTabData | null
  } = {
    feed: null,
    contents: null,
    managed: null,
    rates: null,
    collections: null,
    contributions: null,
    following: null,
    followers: null,
    bookshelf: null,
  }

  if (tab === 'feed') {
    tabData.feed = await fetchBackendData(event, '/api/v3/user/{id}/feed', {
      path: { id },
      query: { limit: FEED_PAGE_SIZE },
    })
  } else if (tab === 'articles') {
    tabData.contents = await fetchBackendData(event, '/api/v3/user/{id}/contents', {
      path: { id },
      query: { page, page_size: SPACE_CONTENT_PAGE_SIZE, content_type: 'article' },
    })
  } else if (tab === 'my-posts' && is_self) {
    tabData.managed = await fetchBackendData(event, '/api/v3/user/me/contents', {
      query: { page, page_size: MANAGED_CONTENT_PAGE_SIZE, type: 'post' },
    })
  } else if (tab === 'my-articles' && is_self) {
    tabData.managed = await fetchBackendData(event, '/api/v3/user/me/contents', {
      query: { page, page_size: MANAGED_CONTENT_PAGE_SIZE, type: 'article' },
    })
  } else if (tab === 'rates') {
    tabData.rates = await fetchBackendData(event, '/api/v3/user/{id}/rates', {
      path: { id },
      query: { page, page_size: SPACE_RATE_PAGE_SIZE },
    })
  } else if (tab === 'collections') {
    tabData.collections = await fetchCollectionCards(event, id)
  } else if (tab === 'contributions') {
    tabData.contributions = await fetchBackendData(event, '/api/v3/user/{id}/contributions', {
      path: { id },
      query: { page, page_size: SPACE_CONTRIBUTION_PAGE_SIZE },
    })
  } else if (tab === 'follows') {
    const [following, followers] = await Promise.all([
      fetchBackendData(event, '/api/v3/user/{id}/following', {
        path: { id },
        query: { page, page_size: SPACE_FOLLOW_PAGE_SIZE },
      }),
      fetchBackendData(event, '/api/v3/user/{id}/followers', {
        path: { id },
        query: { page, page_size: SPACE_FOLLOW_PAGE_SIZE },
      }),
    ])
    tabData.following = following
    tabData.followers = followers
  } else if (tab === 'bookshelf' && is_self) {
    const shelf = readSpaceRouteQuery(getQuery(event)).shelf
    if (shelf === 'manga') {
      const [list, stats] = await Promise.all([
        fetchBackendData(event, '/api/v3/reader/me/manga/reading', {
          query: { page, page_size: SPACE_BOOKSHELF_PAGE_SIZE },
        }),
        fetchBackendData(event, '/api/v3/reader/me/manga/stats'),
      ])
      tabData.bookshelf = { shelf, list, stats }
    } else {
      const [list, stats] = await Promise.all([
        fetchBackendData(event, '/api/v3/reader/me/reading', {
          query: { page, page_size: SPACE_BOOKSHELF_PAGE_SIZE },
        }),
        fetchBackendData(event, '/api/v3/reader/me/stats'),
      ])
      tabData.bookshelf = { shelf, list, stats }
    }
  }

  return { active_tab: tab, ...tabData }
}

export function collectionItemCover(item: SpaceCollectionItem): HikariImageSource | null {
  if (item.type === 'galgame') {
    return topVotedMedia(item.galgame?.covers)
  }
  if (item.type === 'light_novel') {
    return topVotedMedia(item.light_novel?.covers)
  }
  if (item.type === 'manga') {
    return topVotedMedia(item.manga?.covers)
  }
  if (item.type === 'article') return item.article?.cover?.src ?? null
  if (item.type === 'post') return item.post?.covers?.[0]?.media?.src ?? null
  return null
}

async function fetchCollectionCards(event: H3Event, id: number): Promise<SpaceCollectionCard[]> {
  const collections = await fetchBackendData(event, '/api/v3/favorite-collections', {
    query: { owner_id: id },
  })
  return Promise.all(
    collections.map(async collection => {
      const preview = await fetchBackendData(
        event,
        '/api/v3/favorite-collections/{collection_id}/items',
        { path: { collection_id: collection.id }, query: { page: 1, page_size: 4 } },
      ).catch(() => null)
      const cover_previews = (preview?.items ?? [])
        .map(collectionItemCover)
        .filter((src): src is NonNullable<HikariImageSource> => Boolean(src))
      return { ...collection, cover_previews }
    }),
  )
}
