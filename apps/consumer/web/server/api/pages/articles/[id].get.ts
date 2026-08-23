import type { ApiData } from '@hikarinagi/api-contract/v3'
import { getQuery, getRouterParam, type H3Event } from 'h3'
import { COMMENT_PAGE_SIZE, commentFocusId } from '~/features/comment/comment'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type RelatedWork = ApiData<'/api/v3/articles/{id}', 'get'>['related_works'][number]

async function loadAuthorStats(event: H3Event, authorId: number) {
  const stats = await fetchBackendData(event, '/api/v3/user/{id}/statistics', {
    path: { id: authorId },
  }).catch(() => null)
  if (!stats) return null
  return {
    article_count: stats.created_article_count,
    played_count: stats.played_galgame_count,
    read_count: stats.read_light_novel_count,
  }
}

async function loadRecent(event: H3Event, authorId: number, excludeId: number) {
  const res = await fetchBackendData(event, '/api/v3/articles', {
    query: { creator_id: authorId, page: 1, page_size: 6 },
  }).catch(() => null)
  return (res?.items ?? []).filter(a => a.id !== excludeId).slice(0, 5)
}

async function loadOtherReviews(event: H3Event, relatedWorks: RelatedWork[]) {
  const groups = await Promise.all(
    relatedWorks.map(async work => {
      const reviews =
        work.work_type === 'GALGAME'
          ? ((
              await fetchBackendData(event, '/api/v3/galgames/{id}/rates', {
                path: { id: work.id },
                query: { sort: 'hot', page: 1, page_size: 4, has_content: true },
              }).catch(() => null)
            )?.items ?? [])
          : ((
              await fetchBackendData(event, '/api/v3/light-novels/{id}/rates', {
                path: { id: work.id },
                query: { sort: 'hot', page: 1, page_size: 4, has_content: true },
              }).catch(() => null)
            )?.items ?? [])
      return { work, reviews: reviews.slice(0, 2) }
    }),
  )
  return groups.filter(g => g.reviews.length > 0)
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const focusComment = commentFocusId(getQuery(event).comment)
  const article = await fetchBackendData(event, '/api/v3/articles/{id}', { path: { id } })
  const authorId = article.creator?.id ?? null

  const [author, author_stats, recent_articles, other_reviews, comments, favorite] =
    await Promise.all([
      authorId
        ? fetchBackendData(event, '/api/v3/user/{id}', { path: { id: authorId } }).catch(() => null)
        : null,
      authorId ? loadAuthorStats(event, authorId) : null,
      authorId ? loadRecent(event, authorId, id) : [],
      loadOtherReviews(event, article.related_works),
      fetchBackendData(event, '/api/v3/comments', {
        query: {
          target_type: 'article',
          target_id: id,
          page: 1,
          page_size: COMMENT_PAGE_SIZE,
          sort: focusComment != null ? 'time_desc' : 'hot',
          ...(focusComment != null ? { focus_comment_id: focusComment } : {}),
        },
      }).catch(() => null),
      fetchBackendData(event, '/api/v3/user/me/favorite/articles/{article_id}', {
        path: { article_id: id },
      }).catch(() => null),
    ])

  return { article, author, author_stats, recent_articles, other_reviews, comments, favorite }
}

export type ArticlePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
