import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const volume = await fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
    path: { id },
  })
  const [light_novel, volumes, contributors, progress_overview, my_rate, my_cover_vote] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: volume.series_id } }),
      fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', {
        path: { id: volume.series_id },
      }),
      fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/contributors', { path: { id } }),
      fetchBackendData(event, '/api/v3/reader/light-novels/{light_novel_id}/progress', {
        path: { light_novel_id: volume.series_id },
      }).catch(() => null),
      fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/rate', { path: { id } }).catch(
        () => null,
      ),
      fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/covers/vote', {
        path: { id },
      }).catch(() => null),
    ])
  const progress = progress_overview?.progresses?.find(entry => entry.volume_id === id) ?? null

  return { volume, light_novel, volumes, contributors, progress, my_rate, my_cover_vote }
}

export type LightNovelVolumePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
