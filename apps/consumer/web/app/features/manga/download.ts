import type { ApiData } from '@hikarinagi/api-contract/v3'

export type MangaDownloadChapter = ApiData<'/api/v3/mangas/{id}/chapters', 'get'>[number]
export type MangaDownloadPart = ApiData<
  '/api/v3/user/me/manga/download/mangas/{id}/plan',
  'post'
>['parts'][number]
