import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [person, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/people/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  const title = person.trans_name || person.name

  return { title, subtitle: title !== person.name ? person.name : null, history }
}

export type PersonHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/people/${id}/revisions`,
})
