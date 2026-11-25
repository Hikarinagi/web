import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)

  const [character, comparison] = await Promise.all([
    fetchBackendData(event, '/api/v3/characters/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/characters/{id}/comparison', {
      path: { id },
      query: { from: Number(query.from), to: Number(query.to) },
    }),
  ])

  return { title: character.trans_name || character.name, comparison }
}

export type CharacterComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/characters/${id}/revisions`,
})
