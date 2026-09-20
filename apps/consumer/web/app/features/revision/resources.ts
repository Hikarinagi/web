import type { ApiData } from '@hikarinagi/api-contract/v3'

export type WorkResourceSlug =
  | 'galgame'
  | 'light-novel'
  | 'light-novel-volume'
  | 'manga'
  | 'manga-volume'
export type EntityResourceSlug = 'person' | 'character' | 'producer'
export type RevisionResourceSlug = WorkResourceSlug | EntityResourceSlug
export type BackendRevisionList = ApiData<'/api/v3/revisions', 'get'>
export type BackendRevisionSummary = BackendRevisionList['items'][number]
export type BackendRevisionDiff = ApiData<'/api/v3/revisions/{id}/diff', 'get'>
export type RevisionSummaryWithDiff = BackendRevisionSummary & { diff: BackendRevisionDiff | null }

export const REVISION_RESOURCE_TYPE = {
  galgame: 'GALGAME',
  'light-novel': 'LIGHT_NOVEL',
  'light-novel-volume': 'LIGHT_NOVEL_VOLUME',
  manga: 'MANGA',
  'manga-volume': 'MANGA_VOLUME',
  person: 'PERSON',
  character: 'CHARACTER',
  producer: 'PRODUCER',
} satisfies Record<RevisionResourceSlug, BackendRevisionSummary['resource_type']>

export const REVISION_RESOURCE_LABEL = {
  galgame: 'Galgame',
  'light-novel': '轻小说',
  'light-novel-volume': '轻小说卷',
  manga: '漫画',
  'manga-volume': '漫画单行本',
  person: '人物',
  character: '角色',
  producer: '厂商',
} satisfies Record<RevisionResourceSlug, string>

export const REVISION_RESOURCE_BASE_PATH = {
  galgame: '/galgames',
  'light-novel': '/light-novels',
  'light-novel-volume': '/light-novel-volumes',
  manga: '/mangas',
  'manga-volume': '/manga-volumes',
  person: '/people',
  character: '/characters',
  producer: '/producers',
} satisfies Record<RevisionResourceSlug, string>

export function getRevisionHistoryPath(type: RevisionResourceSlug, id: number) {
  return `${REVISION_RESOURCE_BASE_PATH[type]}/${id}/revisions`
}

export function getRevisionEditPath(type: RevisionResourceSlug, id: number) {
  return `/create/edit/${type}/${id}`
}
