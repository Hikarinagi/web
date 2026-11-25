import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [manga, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  const title = manga.name_cn || manga.name

  return { title, subtitle: title !== manga.name ? manga.name : null, history }
}

export type MangaHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/mangas/${id}/revisions`,
})
