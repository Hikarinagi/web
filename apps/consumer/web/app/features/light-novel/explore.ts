import { NOVEL_STATUS_CN } from '@hikarinagi/shared'
import type { ApiData, ApiQuery } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'
import type { TagFilterGroup } from '~/features/browse/filter'
import { encodeTagGroup, normalizeTagGroups, readTagGroups } from '~/features/browse/tag-groups'
import { readYears, writeYears } from '~/features/browse/years'

export const LIGHT_NOVEL_BROWSE_PAGE_SIZE = 40

export type LightNovelSummary = ApiData<'/api/v3/light-novels', 'get'>['items'][number]
export type LightNovelSortField = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['sort_field']>
export type LightNovelSortOrder = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['sort_order']>
export type LightNovelStatus = NonNullable<ApiQuery<'/api/v3/light-novels', 'get'>['novel_status']>
export type { TagFilterGroup, TagFilterOp, TagMatchMode } from '~/features/browse/filter'
export { encodeTagGroup, tagIdsOf } from '~/features/browse/tag-groups'

export interface LightNovelBrowseState {
  page: number
  page_size: number
  sort_field: LightNovelSortField
  sort_order: LightNovelSortOrder
  novel_status?: LightNovelStatus
  readable: boolean
  years: number[]
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
const LEGACY_DECADES: Record<string, string> = {
  '2020s': '2020-2029',
  '2010s': '2010-2019',
  '2000s': '2000-2009',
  earlier: '1900-1999',
}

const STATUS_TEXT: Record<string, string> = NOVEL_STATUS_CN

export function titleOf(item: SeriesCardItem): string {
  return item.name_cn || item.name || `轻小说 #${item.id}`
}

export function yearOf(item: SeriesCardItem): number | null {
  if (!item.publication_date) return null
  const date = new Date(item.publication_date)
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
}

export function statusText(status: LightNovelStatus | null): string {
  return status ? (STATUS_TEXT[status] ?? '') : ''
}

export function overlayText(item: LightNovelSummary): string | undefined {
  return !item.novel_status || item.novel_status === 'SERIALIZING'
    ? undefined
    : statusText(item.novel_status)
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
    sort_field,
    sort_order,
    novel_status: STATUSES.find(item => item === readString(query.status)?.toUpperCase()),
    readable: readBool(query.readable),
    years: readYears(
      [readString(query.years), LEGACY_DECADES[readString(query.decade) ?? '']]
        .filter(Boolean)
        .join(','),
    ),
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

function buildPath(base: string, state: LightNovelBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (sortValue(state) !== 'publication_date:desc') query.set('sort', sortValue(state))
  if (state.novel_status) query.set('status', state.novel_status.toLowerCase())
  if (state.readable) query.set('readable', '1')
  const years = writeYears(state.years)
  if (years) query.set('years', years)
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

function readBool(value: unknown): boolean {
  const raw = readString(value)
  return raw === '1' || raw === 'true'
}

function readInt(value: unknown): number | undefined {
  const raw = readString(value)
  const num = raw != null ? Number(raw) : Number.NaN
  return Number.isInteger(num) && num > 0 ? num : undefined
}
