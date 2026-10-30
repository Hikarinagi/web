import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [product, entry, definitions, todos] = await Promise.all([
    fetchBackendData(event, '/api/v3/products/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
    fetchBackendData(event, '/api/v3/wiki/todos', {
      query: { entry_id: id, page: 1, page_size: 20 },
    }),
  ])

  return { product, entry, definitions, todos }
}

export type ProductEditPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
