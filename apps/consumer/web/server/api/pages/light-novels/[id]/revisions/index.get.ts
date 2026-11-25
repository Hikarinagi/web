import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [lightNovel, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  const title = lightNovel.name_cn || lightNovel.name

  return { title, subtitle: title !== lightNovel.name ? lightNovel.name : null, history }
}

export type LightNovelHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novels/${id}/revisions`,
})
