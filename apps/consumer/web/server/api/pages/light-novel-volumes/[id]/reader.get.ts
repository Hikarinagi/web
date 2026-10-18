import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData, isBackendApiError } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function readerState(event: H3Event, volumeId: number, seriesId: number) {
  try {
    const [settings, state, progress] = await Promise.all([
      fetchBackendData(event, '/api/v3/reader/settings'),
      fetchBackendData(event, '/api/v3/reader/volumes/{volume_id}/state', {
        path: { volume_id: volumeId },
      }),
      fetchBackendData(event, '/api/v3/reader/light-novels/{light_novel_id}/progress', {
        path: { light_novel_id: seriesId },
      }),
    ])
    return { settings, state, progress }
  } catch (error) {
    if (isBackendApiError(error) && error.status === 401) return null
    throw error
  }
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const volume = await fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
    path: { id },
  })
  const [light_novel, volumes, reader] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: volume.series_id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', {
      path: { id: volume.series_id },
    }),
    readerState(event, id, volume.series_id),
  ])

  return { volume, light_novel, volumes, reader }
}

export type LightNovelVolumeReaderPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
