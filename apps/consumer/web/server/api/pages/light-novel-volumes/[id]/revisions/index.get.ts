import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1

  const [volume, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])
  const title = volume.name_cn || volume.name || volume.volume_label || `轻小说卷 #${volume.id}`

  return { title, subtitle: volume.name && title !== volume.name ? volume.name : null, history }
}

export type LightNovelVolumeHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novel-volumes/${id}/revisions`,
})
