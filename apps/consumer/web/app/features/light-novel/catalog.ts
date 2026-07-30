import type { ApiData } from '@hikarinagi/api-contract/v3'

export const CATALOG_PAGE_SIZE = 24

export const CATALOG_SORTS = [
  { value: 'recent', label: '最新发售' },
  { value: 'views', label: '人气' },
  { value: 'publication', label: '最早发售' },
] as const

export type CatalogSort = (typeof CATALOG_SORTS)[number]['value']

export type LightNovelRelationItem = ApiData<
  '/api/v3/producers/{id}/light-novels',
  'get'
>['items'][number]

export interface CatalogMasthead {
  eyebrow: string
  name: string
  sub: string | null
  image: { src: string; width: number | null; height: number | null } | null
  shape: 'square' | 'circle'
  meta: string[]
  website: string | null
}
