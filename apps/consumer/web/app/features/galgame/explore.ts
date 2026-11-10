import type { ApiData, ApiQuery, components } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'
import type { TagFilterGroup } from '~/features/browse/filter'
import { normalizeTagGroups, readTagGroups, encodeTagGroup } from '~/features/browse/tag-groups'
import { readYears, writeYears } from '~/features/browse/years'

export const GALGAME_BROWSE_PAGE_SIZE = 40
export type GalgameSummary = ApiData<'/api/v3/galgames', 'get'>['items'][number]
export type GalgameHistogram = ApiData<'/api/v3/galgames/histogram', 'get'>
export type GalgameSortField = NonNullable<ApiQuery<'/api/v3/galgames', 'get'>['sort_field']>
export type GalgameSortOrder = NonNullable<ApiQuery<'/api/v3/galgames', 'get'>['sort_order']>
export type { TagFilterGroup, TagFilterOp, TagMatchMode } from '~/features/browse/filter'
export { encodeTagGroup, tagIdsOf } from '~/features/browse/tag-groups'

export interface GalgameBrowseState {
  page: number
  page_size: number
  sort_field: GalgameSortField
  sort_order: GalgameSortOrder
  years: number[]
  platforms: string[]
  origin_lang: string[]
  producer_ids: number[]
  tag_groups: TagFilterGroup[]
  staff_person_ids: number[]
  staff_role?: components['schemas']['GalgameStaffRole']
  include_dev: boolean
}

export const GALGAME_SORT_OPTIONS: {
  label: string
  sort_field: GalgameSortField
  sort_order: GalgameSortOrder
  value: string
}[] = [
  {
    label: '发售日 新→旧',
    sort_field: 'release_date',
    sort_order: 'desc',
    value: 'release_date:desc',
  },
  {
    label: '发售日 旧→新',
    sort_field: 'release_date',
    sort_order: 'asc',
    value: 'release_date:asc',
  },
  { label: '最热门', sort_field: 'views', sort_order: 'desc', value: 'views:desc' },
  { label: '标题', sort_field: 'title', sort_order: 'asc', value: 'title:asc' },
  { label: '最近更新', sort_field: 'revised_at', sort_order: 'desc', value: 'revised_at:desc' },
]

const SORT_FIELDS: GalgameSortField[] = [
  'release_date',
  'title',
  'views',
  'revised_at',
  'created_at',
]
const SORT_ORDERS: GalgameSortOrder[] = ['asc', 'desc']

export function readBrowseQuery(query: Record<string, unknown>): GalgameBrowseState {
  const sort = readString(query.sort)
  const [rawField, rawOrder] = sort?.split(':') ?? []
  const sort_field = SORT_FIELDS.includes(rawField as GalgameSortField)
    ? (rawField as GalgameSortField)
    : 'release_date'
  const sort_order = SORT_ORDERS.includes(rawOrder as GalgameSortOrder)
    ? (rawOrder as GalgameSortOrder)
    : 'desc'
  const from = readYears(readString(query.from)?.slice(0, 4))[0]
  const to = readYears(readString(query.to)?.slice(0, 4))[0]
  const legacy = readStrings(query.periods)
    .map(period => period.slice(0, 4))
    .join(',')

  return {
    page: readPageQuery(query),
    page_size: GALGAME_BROWSE_PAGE_SIZE,
    sort_field,
    sort_order,
    years: readYears(
      [
        readString(query.years),
        legacy,
        from || to ? `${from ?? 1900}-${to ?? new Date().getFullYear()}` : undefined,
      ]
        .filter(Boolean)
        .join(','),
    ),
    platforms: readStrings(query.platforms),
    origin_lang: readStrings(query.lang),
    producer_ids: readInts(query.producers),
    tag_groups: readTagGroups(query.tag_groups),
    staff_person_ids: readInts(query.staff),
    staff_role:
      (readString(query.staff_role) as components['schemas']['GalgameStaffRole']) || undefined,
    include_dev: readBool(query.dev),
  }
}

export function browseBff(state: GalgameBrowseState): `/api/pages/${string}` {
  return buildPath('/api/pages/galgames/browse', state) as `/api/pages/${string}`
}

export function browseRoute(state: GalgameBrowseState): string {
  return buildPath('/galgames/browse', state)
}

export function tagRoute(tagId: number): string {
  return browseRoute({
    ...readBrowseQuery({}),
    tag_groups: [{ op: 'include', match: 'and', tag_ids: [tagId] }],
  })
}

export function sortValue(state: Pick<GalgameBrowseState, 'sort_field' | 'sort_order'>): string {
  return `${state.sort_field}:${state.sort_order}`
}

export function titleOf(
  galgame: Pick<GalgameSummary, 'id' | 'trans_title' | 'origin_title'>,
): string {
  return galgame.trans_title || galgame.origin_title || `Galgame #${galgame.id}`
}

export function producerText(galgame: Pick<GalgameSummary, 'producers'>): string {
  const producers = galgame.producers
    .filter(row => !row.role || row.role === 'DEVELOPER')
    .map(row => row.producer.name)

  return producers.length ? producers.slice(0, 2).join(' / ') : '厂商未收录'
}

export function yearText(galgame: Pick<GalgameSummary, 'release_date'>): string {
  if (!galgame.release_date) return '发售日未定'
  const year = new Date(galgame.release_date).getFullYear()
  return Number.isFinite(year) ? String(year) : '发售日未定'
}

function buildPath(base: string, state: GalgameBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (sortValue(state) !== 'release_date:desc') query.set('sort', sortValue(state))
  const years = writeYears(state.years)
  if (years) query.set('years', years)
  if (state.platforms.length) query.set('platforms', state.platforms.join(','))
  if (state.origin_lang.length) query.set('lang', state.origin_lang.join(','))
  if (state.producer_ids.length) query.set('producers', state.producer_ids.join(','))
  for (const group of normalizeTagGroups(state.tag_groups)) {
    query.append('tag_groups', encodeTagGroup(group))
  }
  if (state.staff_person_ids.length) query.set('staff', state.staff_person_ids.join(','))
  if (state.staff_role) query.set('staff_role', state.staff_role)
  if (state.include_dev) query.set('dev', '1')

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

function readInts(value: unknown): number[] {
  return readStrings(value)
    .map(Number)
    .filter(item => Number.isInteger(item))
}

function readBool(value: unknown): boolean {
  const raw = readString(value)
  return raw === '1' || raw === 'true'
}
