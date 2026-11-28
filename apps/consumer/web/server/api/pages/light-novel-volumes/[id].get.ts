import { getRouterParam, type H3Event } from 'h3'
import { volumeSetName } from '@hikarinagi/shared'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const volume = await fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
    path: { id },
  })
  const [light_novel, sets, people, contributors, progress_overview, my_rate] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id: volume.series_id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/sets', {
      path: { id: volume.series_id },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/people', {
      path: { id: volume.series_id },
    }),
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/contributors', { path: { id } }),
    fetchBackendData(event, '/api/v3/reader/light-novels/{light_novel_id}/progress', {
      path: { light_novel_id: volume.series_id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}/rate', { path: { id } }).catch(
      () => null,
    ),
  ])
  const progresses = progress_overview?.progresses ?? null
  const progress = progresses?.find(entry => entry.volume_id === id) ?? null
  const set = sets.find(item => item.volumes.some(entry => entry.id === volume.id))
  const volumes =
    set?.volumes ??
    (await fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', {
      path: { id: volume.series_id },
    }))

  return {
    volume,
    light_novel,
    volumes,
    set_name: set && sets.length > 1 ? volumeSetName(set) : null,
    people,
    contributors,
    progress,
    progresses,
    my_rate,
  }
}

export type LightNovelVolumePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novel-volumes/${id}`,
})
