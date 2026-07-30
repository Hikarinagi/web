import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const volume = await fetchBackendData(event, '/api/v3/manga-volumes/{id}', { path: { id } })
  const seriesId = volume.series_id
  const [chapters, volumes, progress, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/mangas/{id}/chapters', {
      path: { id: seriesId },
    }),
    fetchBackendData(event, '/api/v3/mangas/{id}/volumes', {
      path: { id: seriesId },
    }),
    fetchBackendData(event, '/api/v3/reader/mangas/{manga_id}/progress', {
      path: { manga_id: seriesId },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/manga-volumes/{id}/contributors', { path: { id } }),
  ])

  return { volume, volumes, chapters, progress, contributors }
}

export type MangaVolumePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
