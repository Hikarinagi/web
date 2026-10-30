import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [display, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames/{id}/display', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])

  return { display, history }
}

export type GalgameHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/revisions`,
})
