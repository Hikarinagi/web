import { getRouterParam, type H3Event } from 'h3'
import { INLINE_RELATION_CAP } from '~/features/entity/entity'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = { page: 1, page_size: INLINE_RELATION_CAP, sort: 'recent' } as const

  const [character, galgames, light_novels, mangas, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/characters/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/characters/{id}/galgames', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/light-novels', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/mangas', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/contributors', { path: { id } }),
  ])

  return { character, galgames, light_novels, mangas, contributors }
}

export type CharacterPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/characters/${id}`,
})
