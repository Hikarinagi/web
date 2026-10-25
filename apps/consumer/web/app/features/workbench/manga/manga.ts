import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendMangaProject = ApiData<'/api/v3/manga-projects/{project_id}', 'get'>

export type BackendMangaProjectList = ApiData<'/api/v3/manga-projects', 'get'>

export type BackendMangaProjectListItem = BackendMangaProjectList['items'][number]

export type BackendMangaPage = ApiData<'/api/v3/manga-projects/{project_id}/pages', 'get'>[number]

export type BackendMangaRegion = ApiData<
  '/api/v3/manga-project-pages/{page_id}/regions',
  'get'
>[number]

export type BackendMangaTask = ApiData<'/api/v3/manga-projects/{project_id}/tasks', 'get'>[number]

export type MangaRegionChange = {
  project_id: number
  page_id: number | null
  region_ids: string[]
  kind: 'pages' | 'regions' | 'lock' | 'unlock' | 'state' | 'translation' | 'task'
  actor_id: number
  locked_by?: number | null
  lock_expires_at?: string | null
}
