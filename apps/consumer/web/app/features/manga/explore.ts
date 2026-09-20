import type { ApiData, ApiQuery } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'

export const MANGA_BROWSE_PAGE_SIZE = 24

export type MangaSummary = ApiData<'/api/v3/mangas', 'get'>['items'][number]
export type MangaSortField = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['sort_field']>
export type MangaSortOrder = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['sort_order']>
export type MangaRegion = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['region']>
export type MangaDecade = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['decade']>
export type MangaAudience = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['audience']>
export type MangaSerialStatus = NonNullable<ApiQuery<'/api/v3/mangas', 'get'>['serial_status']>
export type TagFilterOp = 'include' | 'exclude'
export type TagMatchMode = 'and' | 'or'

export interface TagFilterGroup {
  op: TagFilterOp
  match: TagMatchMode
  tag_ids: number[]
}

export interface MangaBrowseState {
  page: number
  page_size: number
  search?: string
  sort_field: MangaSortField
  sort_order: MangaSortOrder
  region?: MangaRegion
  audience?: MangaAudience
  serial_status?: MangaSerialStatus
  decade?: MangaDecade
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

export const MANGA_DECADE_OPTIONS: { label: string; value: MangaDecade }[] = [
  { label: '2020 年代', value: '2020s' },
  { label: '2010 年代', value: '2010s' },
  { label: '2000 年代', value: '2000s' },
  { label: '更早', value: 'earlier' },
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
const DECADES: MangaDecade[] = ['2020s', '2010s', '2000s', 'earlier']
const AUDIENCES: MangaAudience[] = ['SHONEN', 'SEINEN', 'SHOJO', 'JOSEI']
const STATUS_FILTERS: MangaSerialStatus[] = ['SERIALIZING', 'FINISHED', 'PAUSED']
const TAG_GROUP_PATTERN = /^(include|exclude)\.(and|or)\.([1-9]\d*(?:\.[1-9]\d*)*)$/

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
    search: readString(query.search)?.trim() || undefined,
    sort_field,
    sort_order,
    region: REGIONS.find(item => item === readString(query.region)),
    audience: AUDIENCES.find(item => item === readString(query.audience)?.toUpperCase()),
    serial_status: STATUS_FILTERS.find(item => item === readString(query.status)?.toUpperCase()),
    decade: DECADES.find(item => item === readString(query.decade)),
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

export function encodeTagGroup(group: TagFilterGroup): string {
  return `${group.op}.${group.match}.${group.tag_ids.join('.')}`
}

export function tagIdsOf(groups: TagFilterGroup[]): number[] {
  return [
    ...new Set(groups.flatMap(group => group.tag_ids.filter(id => Number.isInteger(id) && id > 0))),
  ]
}

export function sortValue(state: Pick<MangaBrowseState, 'sort_field' | 'sort_order'>): string {
  return `${state.sort_field}:${state.sort_order}`
}

export function titleOf(manga: MangaSummary): string {
  return manga.name_cn || manga.name
}

export function statusText(status: MangaSerialStatus): string {
  return SERIAL_STATUS_TEXT[status]
}

export function overlayText(manga: MangaSummary): string | undefined {
  return manga.serial_status === 'SERIALIZING' ? undefined : statusText(manga.serial_status)
}

export function subText(manga: MangaSummary): string {
  const year = yearOf(manga)
  const status = statusText(manga.serial_status)

  return year ? `${year} · ${status}` : status
}

function yearOf(manga: MangaSummary): string | undefined {
  if (!manga.publication_date) return undefined
  const year = new Date(manga.publication_date).getFullYear()

  return Number.isFinite(year) ? String(year) : undefined
}

function buildPath(base: string, state: MangaBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (state.search) query.set('search', state.search)
  if (sortValue(state) !== 'latest_chapter_at:desc') query.set('sort', sortValue(state))
  if (state.region) query.set('region', state.region)
  if (state.audience) query.set('audience', state.audience.toLowerCase())
  if (state.serial_status) query.set('status', state.serial_status.toLowerCase())
  if (state.decade) query.set('decade', state.decade)
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

function readTagGroups(value: unknown): TagFilterGroup[] {
  return normalizeTagGroups(
    readStrings(value)
      .map(decodeTagGroup)
      .filter((group): group is TagFilterGroup => !!group),
  )
}

function decodeTagGroup(value: string): TagFilterGroup | null {
  const match = TAG_GROUP_PATTERN.exec(value)
  if (!match || !match[1] || !match[2] || !match[3]) return null

  return {
    op: match[1] as TagFilterOp,
    match: match[2] as TagMatchMode,
    tag_ids: match[3].split('.').map(Number),
  }
}

function normalizeTagGroups(groups: TagFilterGroup[]): TagFilterGroup[] {
  const seen = new Set<string>()
  const out: TagFilterGroup[] = []
  for (const group of groups) {
    const tag_ids = [...new Set(group.tag_ids.filter(id => Number.isInteger(id) && id > 0))]
    if (!tag_ids.length) continue

    const normalized: TagFilterGroup = {
      op: group.op,
      match: group.match,
      tag_ids,
    }
    const key = encodeTagGroup(normalized)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(normalized)
  }
  return out
}
