import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)

  const [volume, comparison] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/comparison', {
      path: { id },
      query: { from: Number(query.from), to: Number(query.to) },
    }),
  ])

  return {
    title: volume.name_cn || volume.name || volume.volume_label || `轻小说卷 #${volume.id}`,
    comparison,
  }
}

export type LightNovelVolumeComparisonPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novel-volumes/${id}/revisions`,
})
