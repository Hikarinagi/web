import { getQuery, getRouterParam, type H3Event } from 'h3'
import { COMMENT_PAGE_SIZE, commentFocusId } from '~/features/comment/comment'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { loadFeedSidebar } from '../../../../../features/feed/sidebar'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const rateId = Number(getRouterParam(event, 'rateId'))
  const focusComment = commentFocusId(getQuery(event).comment)
  const rate = await fetchBackendData(event, '/api/v3/galgames/{id}/rates/{rateId}', {
    path: { id, rateId },
  })

  const [author, sidebar, comments, favorite] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/{id}', { path: { id: rate.rater.id } }).catch(() => null),
    loadFeedSidebar(event),
    fetchBackendData(event, '/api/v3/comments', {
      query: {
        target_type: 'galgame_rate',
        target_id: rateId,
        page: 1,
        page_size: COMMENT_PAGE_SIZE,
        sort: focusComment != null ? 'time_desc' : 'hot',
        ...(focusComment != null ? { focus_comment_id: focusComment } : {}),
      },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/galgames/{galgame_id}', {
      path: { galgame_id: id },
    }).catch(() => null),
  ])

  return { rate, author, sidebar, comments, favorite }
}

export type GalgameRatePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
