import type { ApiData, ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type MangaRate = ApiData<'/api/v3/mangas/{id}/rate', 'get'>
export type MangaRateStats = ApiData<'/api/v3/mangas/{id}/rates/statistics', 'get'>
export type UpsertMangaRateBody = ApiRequestBody<'/api/v3/mangas/{id}/rate', 'put'>
export type MangaRateStatus = Exclude<MangaRate['status'], null>
export type MangaRateList = ApiData<'/api/v3/mangas/{id}/rates', 'get'>
export type MangaRateListItem = MangaRateList['items'][number]

export { RATE_HIGHLY_RATED_LIKES } from '~/features/galgame/rate'

export const MANGA_STATUS_ORDER: readonly MangaRateStatus[] = [
  'PLAN',
  'GOING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
]

export const MANGA_STATUS_LABEL: Record<MangaRateStatus, string> = {
  PLAN: '想看',
  GOING: '在看',
  COMPLETED: '看过',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
}

export const MANGA_STATUS_SUB: Record<MangaRateStatus, string> = {
  PLAN: '之后再看',
  GOING: '正在看',
  COMPLETED: '看完了',
  ON_HOLD: '先放一下',
  DROPPED: '不看了',
}
