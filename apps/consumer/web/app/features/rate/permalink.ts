import type { ApiData } from '@hikarinagi/api-contract/v3'
import { workPath, type WorkType } from '#shared/utils/work'

export type BackendGalgameRate = ApiData<'/api/v3/galgames/{id}/rates/{rateId}', 'get'>
export type BackendLightNovelRate = ApiData<'/api/v3/light-novels/{id}/rates/{rateId}', 'get'>
export type BackendMangaRate = ApiData<'/api/v3/mangas/{id}/rates/{rateId}', 'get'>
export type BackendVolumeRate = ApiData<'/api/v3/light-novel-volumes/{id}/rates/{rateId}', 'get'>

export type BackendRate =
  BackendGalgameRate | BackendLightNovelRate | BackendMangaRate | BackendVolumeRate

export function ratePath(workType: WorkType, workId: number, rateId: number): string {
  return `${workPath(workType, workId)}/rates/${rateId}`
}

export function volumeRatePath(volumeId: number, rateId: number): string {
  return `/light-novel-volumes/${volumeId}/rates/${rateId}`
}
