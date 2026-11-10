import type { ApiData, ApiQuery, components } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'
import type { TagFilterGroup } from '~/features/browse/filter'
import { encodeTagGroup, normalizeTagGroups, readTagGroups } from '~/features/browse/tag-groups'
import { readYears, writeYears } from '~/features/browse/years'

export const MANGA_BROWSE_PAGE_SIZE = 40

export type MangaSummary = components['schemas']['MangaSummaryDto']
export type MangaListItem = ApiData<'/api/v3/mangas', 'get'>['items'][number]
export type MangaSortField = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['sort_field']>
export type MangaSortOrder = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['sort_order']>
export type MangaRegion = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['region']>
export type MangaAudience = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['audience']>
export type MangaSerialStatus = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['serial_status']>
export type { TagFilterGroup, TagFilterOp, TagMatchMode } from '~/features/browse/filter'
export { encodeTagGroup, tagIdsOf } from '~/features/browse/tag-groups'

export interface MangaBrowseState {
  page: number
  page_size: number
  sort_field: MangaSortField
  sort_order: MangaSortOrder
  region?: MangaRegion
  audience?: MangaAudience
  serial_status?: MangaSerialStatus
  years: number[]
  magazine_id?: number
  tag?: string
  tag_groups: TagFilterGroup[]
  genre: string[]
}

export const MANGA_SORT_OPTIONS: {
  label: string
  sort_field: MangaSortField
  sort_order: MangaSortOrder
  value: string
}[] = [
  {
    label: '最近更新',
    sort_field: 'latest_chapter_at',
    sort_order: 'desc',
    value: 'latest_chapter_at:desc',
  },
  { label: '最热', sort_field: 'heat', sort_order: 'desc', value: 'heat:desc' },
  { label: '最新收录', sort_field: 'created_at', sort_order: 'desc', value: 'created_at:desc' },
  {
    label: '开始时间 新→旧',
    sort_field: 'publication_date',
    sort_order: 'desc',
    value: 'publication_date:desc',
  },
  {
    label: '开始时间 旧→新',
    sort_field: 'publication_date',
    sort_order: 'asc',
    value: 'publication_date:asc',
  },
  { label: '标题', sort_field: 'name', sort_order: 'asc', value: 'name:asc' },
]

export const MANGA_REGION_OPTIONS: { label: string; value: MangaRegion }[] = [
  { label: '日漫', value: 'jp' },
  { label: '韩漫', value: 'kr' },
  { label: '国漫', value: 'cn' },
  { label: '其他', value: 'other' },
]

export const MANGA_AUDIENCE_OPTIONS: { label: string; value: MangaAudience }[] = [
  { label: '少年', value: 'SHONEN' },
  { label: '青年', value: 'SEINEN' },
  { label: '少女', value: 'SHOJO' },
  { label: '女性', value: 'JOSEI' },
]

export const MANGA_STATUS_OPTIONS: { label: string; value: MangaSerialStatus }[] = [
  { label: '连载中', value: 'SERIALIZING' },
  { label: '已完结', value: 'FINISHED' },
  { label: '休刊', value: 'PAUSED' },
]

const SORT_FIELDS: MangaSortField[] = [
  'latest_chapter_at',
  'created_at',
  'publication_date',
  'views',
  'name',
  'bangumi_rank',
  'heat',
]
const SORT_ORDERS: MangaSortOrder[] = ['asc', 'desc']
const REGIONS: MangaRegion[] = ['jp', 'kr', 'cn', 'other']
const AUDIENCES: MangaAudience[] = ['SHONEN', 'SEINEN', 'SHOJO', 'JOSEI']
const STATUS_FILTERS: MangaSerialStatus[] = ['SERIALIZING', 'FINISHED', 'PAUSED']
const LEGACY_DECADES: Record<string, string> = {
  '2020s': '2020-2029',
  '2010s': '2010-2019',
  '2000s': '2000-2009',
  earlier: '1900-1999',
}

const SERIAL_STATUS_TEXT: Record<MangaSerialStatus, string> = {
  SERIALIZING: '连载中',
  FINISHED: '已完结',
  PAUSED: '休刊',
  ABANDONED: '休刊',
}

export function readBrowseQuery(query: Record<string, unknown>): MangaBrowseState {
  const sort = readString(query.sort)
  const [rawField, rawOrder] = sort?.split(':') ?? []
  const sort_field = SORT_FIELDS.includes(rawField as MangaSortField)
    ? (rawField as MangaSortField)
    : 'latest_chapter_at'
  const sort_order = SORT_ORDERS.includes(rawOrder as MangaSortOrder)
    ? (rawOrder as MangaSortOrder)
    : 'desc'

  return {
    page: readPageQuery(query),
    page_size: MANGA_BROWSE_PAGE_SIZE,
    sort_field,
    sort_order,
    region: REGIONS.find(item => item === readString(query.region)),
    audience: AUDIENCES.find(item => item === readString(query.audience)?.toUpperCase()),
    serial_status: STATUS_FILTERS.find(item => item === readString(query.status)?.toUpperCase()),
    years: readYears(
      [readString(query.years), LEGACY_DECADES[readString(query.decade) ?? '']]
        .filter(Boolean)
        .join(','),
    ),
    magazine_id: readInt(query.magazine_id),
    tag: readString(query.tag)?.trim() || undefined,
    tag_groups: readTagGroups(query.tag_groups),
    genre: readStrings(query.genre),
  }
}

export function browseBff(state: MangaBrowseState): `/api/pages/${string}` {
  return buildPath('/api/pages/mangas/browse', state) as `/api/pages/${string}`
}

export function browseRoute(state: MangaBrowseState): string {
  return buildPath('/mangas/browse', state)
}

export function tagRoute(tagId: number): string {
  return browseRoute({
    ...readBrowseQuery({}),
    tag_groups: [{ op: 'include', match: 'and', tag_ids: [tagId] }],
  })
}

export function sortValue(state: Pick<MangaBrowseState, 'sort_field' | 'sort_order'>): string {
  return `${state.sort_field}:${state.sort_order}`
}

export function titleOf(manga: Pick<MangaSummary, 'name' | 'name_cn'>): string {
  return manga.name_cn || manga.name
}

export function statusText(status: MangaSerialStatus | null): string {
  return status ? SERIAL_STATUS_TEXT[status] : ''
}

export function overlayText(manga: Pick<MangaSummary, 'serial_status'>): string | undefined {
  return !manga.serial_status || manga.serial_status === 'SERIALIZING'
    ? undefined
    : statusText(manga.serial_status)
}

export function subText(manga: Pick<MangaSummary, 'publication_date' | 'serial_status'>): string {
  const year = manga.publication_date ? new Date(manga.publication_date).getFullYear() : Number.NaN
  return [Number.isFinite(year) ? String(year) : undefined, statusText(manga.serial_status)]
    .filter(Boolean)
    .join(' ')
}

function buildPath(base: string, state: MangaBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (sortValue(state) !== 'latest_chapter_at:desc') query.set('sort', sortValue(state))
  if (state.region) query.set('region', state.region)
  if (state.audience) query.set('audience', state.audience.toLowerCase())
  if (state.serial_status) query.set('status', state.serial_status.toLowerCase())
  const years = writeYears(state.years)
  if (years) query.set('years', years)
  if (state.magazine_id) query.set('magazine_id', String(state.magazine_id))
  if (state.tag) query.set('tag', state.tag)
  if (state.genre.length) query.set('genre', state.genre.join(','))
  for (const group of normalizeTagGroups(state.tag_groups)) {
    query.append('tag_groups', encodeTagGroup(group))
  }

  const search = query.toString()
  return `${base}${search ? `?${search}` : ''}`
}

function readString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}

function readInt(value: unknown): number | undefined {
  const raw = readString(value)
  const num = raw != null ? Number(raw) : Number.NaN
  return Number.isInteger(num) && num > 0 ? num : undefined
}

function readStrings(value: unknown): string[] {
  if (value == null) return []
  const raw = Array.isArray(value) ? value : String(value).split(',')
  return raw.map(item => String(item).trim()).filter(Boolean)
}
