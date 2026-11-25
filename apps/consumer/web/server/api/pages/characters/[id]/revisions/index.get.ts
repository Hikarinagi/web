import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [character, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/characters/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/characters/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  const title = character.trans_name || character.name

  return { title, subtitle: title !== character.name ? character.name : null, history }
}

export type CharacterHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/characters/${id}/revisions`,
})
