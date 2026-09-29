import type { ApiData } from '@hikarinagi/api-contract/v3'

export type DownloadCards = ApiData<'/api/v3/user/me/download/cards', 'get'>
export type DownloadPlan =
  | ApiData<'/api/v3/user/me/novel/download/series/{id}/plan', 'post'>
  | ApiData<'/api/v3/user/me/manga/download/mangas/{id}/plan', 'post'>
export type DownloadPart = DownloadPlan['parts'][number]
