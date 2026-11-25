import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)

  const [producer, comparison] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/comparison', {
      path: { id },
      query: { from: Number(query.from), to: Number(query.to) },
    }),
  ])

  return { title: producer.name, comparison }
}

export type ProducerComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/producers/${id}/revisions`,
})
