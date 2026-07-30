import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const volume = await fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
    path: { id },
  })
  const [light_novel, settings, state] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', {
      path: { id: volume.series_id },
    }),
    fetchBackendData(event, '/api/v3/reader/settings'),
    fetchBackendData(event, '/api/v3/reader/volumes/{volume_id}/state', {
      path: { volume_id: id },
    }),
  ])

  return { volume, light_novel, settings, state }
}

export type LightNovelVolumeReaderPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
