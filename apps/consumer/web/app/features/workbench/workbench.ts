import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendNovelProject = ApiData<'/api/v3/novel-projects/{project_id}', 'get'>

export type BackendNovelProjectList = ApiData<'/api/v3/novel-projects', 'get'>

export type BackendNovelProjectListItem = BackendNovelProjectList['items'][number]

export type BackendNovelChapter = ApiData<
  '/api/v3/novel-projects/{project_id}/chapters',
  'get'
>[number]

export type BackendNovelSegment = ApiData<
  '/api/v3/novel-chapters/{chapter_id}/segments',
  'get'
>[number]

export type BackendNovelTranslation = BackendNovelSegment['translations'][number]

export type BackendNovelTerm = ApiData<'/api/v3/light-novels/{light_novel_id}/terms', 'get'>[number]

export type BackendAiQuota = ApiData<'/api/v3/user/me/ai-quota', 'get'>

export type BackendNovelImportPreview = ApiData<
  '/api/v3/novel-projects/{project_id}/import/preview',
  'post'
>

export type NovelImportDraft = {
  preview: BackendNovelImportPreview
  file: File | null
  name: string
}

export type NovelSegmentChange = {
  project_id: number
  chapter_id: number | null
  segment_ids: string[]
  kind: 'chapters' | 'source' | 'lock' | 'unlock' | 'state' | 'translation' | 'machine'
  actor_id: number
  locked_by?: number | null
  lock_expires_at?: string | null
}
