import { getQuery, getRouterParam, type H3Event } from 'h3'
import { COMMENT_PAGE_SIZE, commentFocusId } from '~/features/comment/comment'
import { fetchBackendData } from '../../../utils/backend-api'
import { loadFeedSidebar } from '../../../features/feed/sidebar'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const focusComment = commentFocusId(getQuery(event).comment)
  const post = await fetchBackendData(event, '/api/v3/posts/{id}', { path: { id } })
  const authorId = post.creator?.id ?? null

  const [author, sidebar, comments, favorite] = await Promise.all([
    authorId
      ? fetchBackendData(event, '/api/v3/user/{id}', { path: { id: authorId } }).catch(() => null)
      : null,
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

  return { post, author, sidebar, comments, favorite }
}

export type PostPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
