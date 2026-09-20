import { NOVEL_STATUS_CN } from '@hikarinagi/shared'
import type { ApiData, ApiQuery } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'

export const LIGHT_NOVEL_BROWSE_PAGE_SIZE = 24

export type LightNovelSummary = ApiData<'/api/v3/light-novels', 'get'>['items'][number]
export type LightNovelSortField = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['sort_field']>
export type LightNovelSortOrder = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['sort_order']>
export type LightNovelStatus = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['novel_status']>
export type LightNovelDecade = '2020s' | '2010s' | '2000s' | 'earlier'
export type TagFilterOp = 'include' | 'exclude'
export type TagMatchMode = 'and' | 'or'

export interface TagFilterGroup {
  op: TagFilterOp
  match: TagMatchMode
  tag_ids: number[]
}

export interface LightNovelBrowseState {
  page: number
  page_size: number
  search?: string
  sort_field: LightNovelSortField
  sort_order: LightNovelSortOrder
  novel_status?: LightNovelStatus
  readable: boolean
  decade?: LightNovelDecade
  bunko_id?: number
  tag_groups: TagFilterGroup[]
}

/**
 * Structural shape shared by the list summary and the relation target, so one
 * card can render every rail (list rails, author/bunko works, series relations).
 */
export interface SeriesCardItem {
  id: number
  name: string
  name_cn?: string | null
  nsfw?: boolean | null
  publication_date?: string | Date | null
  covers: {
    media: {
      src?: string | null
      nsfw?: boolean | null
      sexual?: number | null
      violence?: number | null
    } | null
  }[]
}

export const LIGHT_NOVEL_SORT_OPTIONS: {
  label: string
  sort_field: LightNovelSortField
  sort_order: LightNovelSortOrder
  value: string
}[] = [
  {
    label: '发售日 新→旧',
    sort_field: 'publication_date',
    sort_order: 'desc',
    value: 'publication_date:desc',
  },
  {
    label: '发售日 旧→新',
    sort_field: 'publication_date',
    sort_order: 'asc',
    value: 'publication_date:asc',
  },
  { label: '最近更新', sort_field: 'revised_at', sort_order: 'desc', value: 'revised_at:desc' },
  { label: '最多阅读', sort_field: 'read_times', sort_order: 'desc', value: 'read_times:desc' },
  { label: '最新收录', sort_field: 'created_at', sort_order: 'desc', value: 'created_at:desc' },
]

export const LIGHT_NOVEL_STATUS_OPTIONS: { label: string; value: LightNovelStatus }[] = [
  { label: '连载中', value: 'SERIALIZING' },
  { label: '已完结', value: 'FINISHED' },
  { label: '休刊', value: 'PAUSED' },
]

export const LIGHT_NOVEL_DECADE_OPTIONS: { label: string; value: LightNovelDecade }[] = [
  { label: '2020 年代', value: '2020s' },
  { label: '2010 年代', value: '2010s' },
  { label: '2000 年代', value: '2000s' },
  { label: '更早', value: 'earlier' },
]

const SORT_FIELDS: LightNovelSortField[] = [
  'publication_date',
  'revised_at',
  'created_at',
  'views',
  'read_times',
  'download_times',
]
const SORT_ORDERS: LightNovelSortOrder[] = ['asc', 'desc']
const STATUSES: LightNovelStatus[] = ['SERIALIZING', 'FINISHED', 'PAUSED', 'ABANDONED']
const DECADES: LightNovelDecade[] = ['2020s', '2010s', '2000s', 'earlier']
const TAG_GROUP_PATTERN = /^(include|exclude)\.(and|or)\.([1-9]\d*(?:\.[1-9]\d*)*)$/

const STATUS_TEXT: Record<string, string> = NOVEL_STATUS_CN

export function titleOf(item: SeriesCardItem): string {
  return item.name_cn || item.name || `轻小说 #${item.id}`
}

export function yearOf(item: SeriesCardItem): number | null {
  if (!item.publication_date) return null
  const date = new Date(item.publication_date)
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
}

export function statusText(status: LightNovelStatus): string {
  return STATUS_TEXT[status] ?? '连载中'
}

export function overlayText(item: LightNovelSummary): string | undefined {
  return item.novel_status === 'SERIALIZING' ? undefined : statusText(item.novel_status)
}

export function subText(item: LightNovelSummary): string {
  const year = yearOf(item)
  return item.author?.name || item.bunko?.name || (year ? String(year) : '轻小说')
}

export function readBrowseQuery(query: Record<string, unknown>): LightNovelBrowseState {
  const sort = readString(query.sort)
  const [rawField, rawOrder] = sort?.split(':') ?? []
  const sort_field = SORT_FIELDS.includes(rawField as LightNovelSortField)
    ? (rawField as LightNovelSortField)
    : 'publication_date'
  const sort_order = SORT_ORDERS.includes(rawOrder as LightNovelSortOrder)
    ? (rawOrder as LightNovelSortOrder)
    : 'desc'

  return {
    page: readPageQuery(query),
    page_size: LIGHT_NOVEL_BROWSE_PAGE_SIZE,
    search: readString(query.search)?.trim() || undefined,
    sort_field,
    sort_order,
    novel_status: STATUSES.find(item => item === readString(query.status)?.toUpperCase()),
    readable: readBool(query.readable),
    decade: DECADES.find(item => item === readString(query.decade)),
    bunko_id: readInt(query.bunko_id),
    tag_groups: readTagGroups(query.tag_groups),
  }
}

export function browseBff(state: LightNovelBrowseState): `/api/pages/${string}` {
  return buildPath('/api/pages/light-novels/browse', state) as `/api/pages/${string}`
}

export function browseRoute(state: LightNovelBrowseState): string {
  return buildPath('/light-novels/browse', state)
}

export function tagRoute(tagId: number): string {
  return browseRoute({
    ...readBrowseQuery({}),
    tag_groups: [{ op: 'include', match: 'and', tag_ids: [tagId] }],
  })
}

export function sortValue(state: Pick<LightNovelBrowseState, 'sort_field' | 'sort_order'>): string {
  return `${state.sort_field}:${state.sort_order}`
}

export function encodeTagGroup(group: TagFilterGroup): string {
  return `${group.op}.${group.match}.${group.tag_ids.join('.')}`
}

export function tagIdsOf(groups: TagFilterGroup[]): number[] {
  return [
    ...new Set(groups.flatMap(group => group.tag_ids.filter(id => Number.isInteger(id) && id > 0))),
  ]
}

function buildPath(base: string, state: LightNovelBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (state.search) query.set('search', state.search)
  if (sortValue(state) !== 'publication_date:desc') query.set('sort', sortValue(state))
  if (state.novel_status) query.set('status', state.novel_status.toLowerCase())
  if (state.readable) query.set('readable', '1')
  if (state.decade) query.set('decade', state.decade)
  if (state.bunko_id) query.set('bunko_id', String(state.bunko_id))
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

function readStrings(value: unknown): string[] {
  if (value == null) return []
  const raw = Array.isArray(value) ? value : String(value).split(',')
  return raw.map(item => String(item).trim()).filter(Boolean)
}

function readBool(value: unknown): boolean {
  const raw = readString(value)
  return raw === '1' || raw === 'true'
}

function readInt(value: unknown): number | undefined {
  const raw = readString(value)
  const num = raw != null ? Number(raw) : Number.NaN
  return Number.isInteger(num) && num > 0 ? num : undefined
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
