import { getQuery, getRouterParam, type H3Event } from 'h3'
import { COMMENT_PAGE_SIZE, commentFocusId } from '~/features/comment/comment'
import { fetchBackendData } from '../../../utils/backend-api'
import { loadFeedSidebar } from '../../../features/feed/sidebar'
import { definePageBffHandler } from '../../../utils/page-bff'

async function loadAuthorStats(event: H3Event, authorId: number) {
  const stats = await fetchBackendData(event, '/api/v3/user/{id}/statistics', {
    path: { id: authorId },
  }).catch(() => null)
  if (!stats) return null
  return {
    post_count: stats.created_post_count,
    played_count: stats.played_galgame_count,
    read_count: stats.read_light_novel_count,
  }
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const focusComment = commentFocusId(getQuery(event).comment)
  const post = await fetchBackendData(event, '/api/v3/posts/{id}', { path: { id } })
  const authorId = post.creator?.id ?? null

  const [author, author_stats, sidebar, comments, favorite] = await Promise.all([
    authorId
      ? fetchBackendData(event, '/api/v3/user/{id}', { path: { id: authorId } }).catch(() => null)
      : null,
    authorId ? loadAuthorStats(event, authorId) : null,
    loadFeedSidebar(event),
    fetchBackendData(event, '/api/v3/comments', {
      query: {
        target_type: 'post',
        target_id: id,
        page: 1,
        page_size: COMMENT_PAGE_SIZE,
        sort: focusComment != null ? 'time_desc' : 'hot',
        ...(focusComment != null ? { focus_comment_id: focusComment } : {}),
      },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/posts/{post_id}', {
      path: { post_id: id },
    }).catch(() => null),
  ])

  return { post, author, author_stats, sidebar, comments, favorite }
}

export type PostPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
