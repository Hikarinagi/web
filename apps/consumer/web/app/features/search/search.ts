import type { ApiData } from '@hikarinagi/api-contract/v3'

export type InstantResult = ApiData<'/api/v3/search/instant', 'get'>
export type InstantGroup = InstantResult['groups'][number]
export type SearchHit = InstantGroup['items'][number]
export type SearchType = SearchHit['type']
export type TrendingItem = ApiData<'/api/v3/search/trending', 'get'>['items'][number]
export type Suggestion = ApiData<'/api/v3/search/suggestions', 'get'>['items'][number]

export const SEARCH_TYPES = [
  'galgame',
  'light_novel',
  'light_novel_volume',
  'manga',
  'character',
  'person',
  'producer',
  'post',
  'article',
] as const satisfies readonly SearchType[]

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  galgame: 'Galgame',
  light_novel: '轻小说',
  light_novel_volume: '分卷',
  character: '角色',
  person: '人物',
  producer: '厂商',
  manga: '漫画',
  post: '图文',
  article: '文章',
}

const ENTITY_BASE: Record<SearchType, string> = {
  galgame: '/galgames',
  light_novel: '/light-novels',
  light_novel_volume: '/light-novel-volumes',
  character: '/characters',
  person: '/people',
  producer: '/producers',
  manga: '/mangas',
  post: '/posts',
  article: '/articles',
}

export function isContentType(type: SearchType): boolean {
  return type === 'post' || type === 'article'
}

export function entityHref(hit: Pick<SearchHit, 'type' | 'id'>): string {
  return `${ENTITY_BASE[hit.type]}/${hit.id}`
}

export function searchHref(keyword: string): string {
  return `/search?q=${encodeURIComponent(keyword.trim())}`
}

export const SEARCH_LISTBOX_ID = 'hikari-search-listbox'

export function searchOptionId(index: number): string {
  return `hikari-search-opt-${index}`
}
