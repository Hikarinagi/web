import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)

  const [manga, comparison] = await Promise.all([
    fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/comparison', {
      path: { id },
      query: { from: Number(query.from), to: Number(query.to) },
    }),
  ])

  return { title: manga.name_cn || manga.name, comparison }
}

export type MangaComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/mangas/${id}/revisions`,
})
