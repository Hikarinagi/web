import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)

  const [display, comparison] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames/{id}/display', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/comparison', {
      path: { id },
      query: { from: Number(query.from), to: Number(query.to) },
    }),
  ])

  return { display, comparison }
}

export type GalgameComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/revisions`,
})
