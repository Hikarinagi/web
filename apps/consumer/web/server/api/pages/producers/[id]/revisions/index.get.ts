import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [producer, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])

  return { title: producer.name, subtitle: null, history }
}

export type ProducerHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/producers/${id}/revisions`,
})
