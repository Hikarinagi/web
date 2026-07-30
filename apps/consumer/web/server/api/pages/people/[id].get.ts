import { getRouterParam, type H3Event } from 'h3'
import { INLINE_RELATION_CAP } from '~/features/entity/entity'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = { page: 1, page_size: INLINE_RELATION_CAP, sort: 'recent' } as const

  const [person, galgames, light_novels, mangas, characters, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/galgames', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/people/{id}/light-novels', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/people/{id}/mangas', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/people/{id}/characters', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/people/{id}/contributors', { path: { id } }),
  ])

  return { person, galgames, light_novels, mangas, characters, contributors }
}

export type PeoplePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/people/${id}`,
})
