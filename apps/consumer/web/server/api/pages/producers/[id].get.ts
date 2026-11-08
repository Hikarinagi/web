import { getRouterParam, type H3Event } from 'h3'
import { INLINE_RELATION_CAP } from '~/features/entity/entity'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = { page: 1, page_size: INLINE_RELATION_CAP, sort: 'recent' } as const

  const [producer, galgames, light_novels, mangas, relations, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/producers/{id}/galgames', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/producers/{id}/light-novels', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/producers/{id}/mangas', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/producers/{id}/relations', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/producers/{id}/contributors', { path: { id } }),
  ])

  return { producer, galgames, light_novels, mangas, relations, contributors }
}

export type ProducerPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/producers/${id}`,
})
