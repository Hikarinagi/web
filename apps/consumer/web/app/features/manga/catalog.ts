export const CATALOG_PAGE_SIZE = 24

export const CATALOG_SORTS = [
  { value: 'recent', label: '最新连载' },
  { value: 'views', label: '人气' },
  { value: 'publication', label: '最早连载' },
] as const

export type CatalogSort = (typeof CATALOG_SORTS)[number]['value']

export interface CatalogMasthead {
  eyebrow: string
  name: string
  sub: string | null
  image: { src: string; width: number | null; height: number | null } | null
  shape: 'square' | 'circle'
  meta: string[]
  website: string | null
}

export const MANGA_STAFF_CATALOGS = {
  author: { role: 'AUTHOR', eyebrow: '作者' },
  artist: { role: 'ART', eyebrow: '作画' },
  original: { role: 'ORIGINAL_CREATOR', eyebrow: '原作' },
  script: { role: 'SCRIPT', eyebrow: '脚本' },
  illustrator: { role: 'ILLUSTRATION', eyebrow: '插图' },
  'character-design': { role: 'CHARACTER_DESIGN', eyebrow: '人物原案' },
} as const

export type MangaStaffCatalogSlug = keyof typeof MANGA_STAFF_CATALOGS
