import type { ApiData } from '@hikarinagi/api-contract/v3'

export interface MangaTarget {
  id: number
  title: string
}

export type MangaTargetChapter = ApiData<'/api/v3/mangas/{id}/chapters', 'get'>[number]

export type MangaTargetClaim = ApiData<'/api/v3/manga-projects', 'get'>['items'][number]
