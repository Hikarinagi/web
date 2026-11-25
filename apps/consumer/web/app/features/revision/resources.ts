export type WorkResourceSlug =
  'galgame' | 'light-novel' | 'light-novel-volume' | 'manga' | 'manga-volume'
export type EntityResourceSlug = 'person' | 'character' | 'producer'
export type RevisionResourceSlug = WorkResourceSlug | EntityResourceSlug

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
