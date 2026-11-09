import type { ApiData } from '@hikarinagi/api-contract/v3'

export type WikiSearchItem = ApiData<'/api/v3/wiki/entries', 'get'>[number]

const READER_PATHS: Record<string, string> = {
  galgame: '/galgames',
  light_novel: '/light-novels',
  light_novel_volume: '/light-novel-volumes',
  manga: '/mangas',
  manga_volume: '/manga-volumes',
  character: '/characters',
  person: '/people',
  producer: '/producers',
}

export function readerPath(resource: { kind: string; id: number } | null): string | null {
  const path = resource ? READER_PATHS[resource.kind] : undefined
  return path && resource ? `${path}/${resource.id}` : null
}

export const FINDER_TYPES = [
  'GAME',
  'PRODUCT',
  'SERIES',
  'VOLUME',
  'BOOK',
  'APPEARANCE',
  'PERSON',
  'ORGANIZATION',
] as const

const foldName = (text: string) =>
  text
    .normalize('NFKC')
    .replace(/[\s・･]/g, '')
    .toLowerCase()

export function sameName(a: string, b: string): boolean {
  return foldName(a) === foldName(b)
}

export function describeFound(item: WikiSearchItem, typeName: string): string {
  if (item.owner) return `${typeName}，《${item.owner.label}》`
  if (item.works.length)
    return `${typeName}，${item.works.map(work => `《${work.label}》`).join('')}`
  return typeName
}
