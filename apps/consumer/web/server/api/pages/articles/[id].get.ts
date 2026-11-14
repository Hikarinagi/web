import { getQuery, getRouterParam, type H3Event } from 'h3'
import { COMMENT_PAGE_SIZE, commentFocusId } from '~/features/comment/comment'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function loadRecent(event: H3Event, authorId: number, excludeId: number) {
  const res = await fetchBackendData(event, '/api/v3/articles', {
    query: { creator_id: authorId, page: 1, page_size: 6 },
  }).catch(() => null)
  return (res?.items ?? []).filter(a => a.id !== excludeId).slice(0, 5)
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const focusComment = commentFocusId(getQuery(event).comment)
  const article = await fetchBackendData(event, '/api/v3/articles/{id}', { path: { id } })
  const authorId = article.creator?.id ?? null

  const [author, recent_articles, other_reviews, comments, favorite] = await Promise.all([
    authorId
      ? fetchBackendData(event, '/api/v3/user/{id}', { path: { id: authorId } }).catch(() => null)
      : null,
    authorId ? loadRecent(event, authorId, id) : [],
    fetchBackendData(event, '/api/v3/articles/{id}/works/rates', { path: { id } }).catch(() => []),
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

  return { article, author, recent_articles, other_reviews, comments, favorite }
}

export type ArticlePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
