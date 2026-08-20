import type { ApiData, ApiQuery, components } from '@hikarinagi/api-contract/v3'
import { readPageQuery } from '#shared/utils/query'

export const GALGAME_BROWSE_PAGE_SIZE = 24
export const GALGAME_EXPLORE_MOSAIC_SIZE = 36

export type GalgameSummary = ApiData<'/api/v3/galgames', 'get'>['items'][number]
export type GalgameHeroCover = ApiData<'/api/v3/galgames/covers/hero', 'get'>[number]
export type GalgameHistogram = ApiData<'/api/v3/galgames/histogram', 'get'>
export type GalgameSortField = NonNullable<ApiQuery<'/api/v3/galgames', 'get'>['sort_field']>
export type GalgameSortOrder = NonNullable<ApiQuery<'/api/v3/galgames', 'get'>['sort_order']>
export type ReleaseFilterMode = 'range' | 'periods'
export type TagFilterOp = 'include' | 'exclude'
export type TagMatchMode = 'and' | 'or'
export type GalgameDevStatus = components['schemas']['GalgameDevStatus']
export type BrowseViewMode = 'grid' | 'list'

export interface TagFilterGroup {
  op: TagFilterOp
  match: TagMatchMode
  tag_ids: number[]
}

export interface GalgameBrowseState {
  page: number
  page_size: number
  search?: string
  sort_field: GalgameSortField
  sort_order: GalgameSortOrder
  start_from?: string
  start_to?: string
  start_periods: string[]
  end_from?: string
  end_to?: string
  end_periods: string[]
  platforms: string[]
  origin_lang: string[]
  producer_ids: number[]
  tag_groups: TagFilterGroup[]
  staff_person_ids: number[]
  staff_role?: components['schemas']['GalgameStaffRole']
  include_dev: boolean
  dev_status: GalgameDevStatus[]
}

export const GALGAME_SORT_OPTIONS: {
  label: string
  sort_field: GalgameSortField
  sort_order: GalgameSortOrder
  value: string
}[] = [
  { label: '最新完结', sort_field: 'end_date', sort_order: 'desc', value: 'end_date:desc' },
  { label: '最早连载', sort_field: 'start_date', sort_order: 'asc', value: 'start_date:asc' },
  { label: '最新创建', sort_field: 'created_at', sort_order: 'desc', value: 'created_at:desc' },
  { label: '热门', sort_field: 'views', sort_order: 'desc', value: 'views:desc' },
  {
    label: '热议',
    sort_field: 'discussion_heat',
    sort_order: 'desc',
    value: 'discussion_heat:desc',
  },
]

const SORT_FIELDS: GalgameSortField[] = [
  'release_date',
  'start_date',
  'end_date',
  'title',
  'views',
  'revised_at',
  'created_at',
  'discussion_heat',
]
const SORT_ORDERS: GalgameSortOrder[] = ['asc', 'desc']
const DEV_STATUSES: GalgameDevStatus[] = ['RELEASED', 'IN_DEVELOPMENT', 'CANCELLED']
const RELEASE_BOUND_PATTERN = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/
const TAG_GROUP_PATTERN = /^(include|exclude)\.(and|or)\.([1-9]\d*(?:\.[1-9]\d*)*)$/

export function readBrowseQuery(query: Record<string, unknown>): GalgameBrowseState {
  const sort = readString(query.sort)
  const [rawField, rawOrder] = sort?.split(':') ?? []
  const parsedField = SORT_FIELDS.includes(rawField as GalgameSortField)
    ? (rawField as GalgameSortField)
    : 'created_at'
  // 旧链接里的 release_date 排序映射到 start_date
  const sort_field = parsedField === 'release_date' ? 'start_date' : parsedField
  const rawSortOrder = SORT_ORDERS.includes(rawOrder as GalgameSortOrder)
    ? (rawOrder as GalgameSortOrder)
    : 'desc'
  // discussion_heat 固定降序,后端忽略 sort_order
  const sort_order = sort_field === 'discussion_heat' ? 'desc' : rawSortOrder
  const [start_from, start_to] = orderReleaseBounds(
    // 旧参数 from/to 按开始时间读取
    readReleaseBound(query.sfrom) ?? readReleaseBound(query.from),
    readReleaseBound(query.sto) ?? readReleaseBound(query.to),
  )
  const start_periods = readReleasePeriods(query.speriods ?? query.periods)
  const [end_from, end_to] = orderReleaseBounds(
    readReleaseBound(query.efrom),
    readReleaseBound(query.eto),
  )
  const end_periods = readReleasePeriods(query.eperiods)

  return {
    page: readPageQuery(query),
    page_size: GALGAME_BROWSE_PAGE_SIZE,
    search: readString(query.search)?.trim() || undefined,
    sort_field,
    sort_order,
    start_from: start_periods.length ? undefined : start_from,
    start_to: start_periods.length ? undefined : start_to,
    start_periods,
    end_from: end_periods.length ? undefined : end_from,
    end_to: end_periods.length ? undefined : end_to,
    end_periods,
    platforms: readStrings(query.platforms),
    origin_lang: readStrings(query.lang),
    producer_ids: readInts(query.producers),
    tag_groups: readTagGroups(query.tag_groups),
    staff_person_ids: readInts(query.staff),
    staff_role:
      (readString(query.staff_role) as components['schemas']['GalgameStaffRole']) || undefined,
    include_dev: readBool(query.dev),
    dev_status: readDevStatuses(query.status),
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

export function encodeTagGroup(group: TagFilterGroup): string {
  return `${group.op}.${group.match}.${group.tag_ids.join('.')}`
}

export function tagIdsOf(groups: TagFilterGroup[]): number[] {
  return [
    ...new Set(groups.flatMap(group => group.tag_ids.filter(id => Number.isInteger(id) && id > 0))),
  ]
}

export function titleOf(galgame: GalgameSummary): string {
  return galgame.trans_title || galgame.origin_title || `Galgame #${galgame.id}`
}

export function producerText(galgame: GalgameSummary): string {
  const producers = galgame.producers
    .filter(row => !row.role || row.role === 'DEVELOPER')
    .map(row => row.producer.name)

  return producers.length ? producers.slice(0, 2).join(' / ') : '厂商未收录'
}

export function releaseRangeLabel(from: string | undefined, to: string | undefined): string {
  if (!from && !to) return '全部年代'
  if (from && to) {
    if (from === to) return releaseBoundLabel(from)
    return `${releaseBoundLabel(from)} – ${releaseBoundLabel(to)}`
  }
  if (from) return `${releaseBoundLabel(from)} 起`

  return `截至 ${releaseBoundLabel(to || '')}`
}

export function releasePeriodsLabel(periods: string[]): string {
  if (!periods.length) return '未指定'

  const labels = periods.slice(0, 3).map(releasePeriodLabel)
  return periods.length > 3 ? `${labels.join('、')} +${periods.length - 3}` : labels.join('、')
}

export function releasePeriodLabel(value: string): string {
  return releaseBoundLabel(value)
}

export function yearText(galgame: GalgameSummary): string {
  if (!galgame.start_date) return '发售日未定'
  // date 字段按日历日处理,取 ISO 前 4 位年份,避免负时区偏移一年
  const year = Number(galgame.start_date.slice(0, 4))
  return Number.isFinite(year) && year > 0 ? String(year) : '发售日未定'
}

function buildPath(base: string, state: GalgameBrowseState): string {
  const query = new URLSearchParams()
  if (state.page > 1) query.set('page', String(state.page))
  if (state.search) query.set('search', state.search)
  if (sortValue(state) !== 'created_at:desc') query.set('sort', sortValue(state))
  if (state.start_periods.length) {
    query.set('speriods', state.start_periods.join(','))
  } else {
    if (state.start_from) query.set('sfrom', state.start_from)
    if (state.start_to) query.set('sto', state.start_to)
  }
  if (state.end_periods.length) {
    query.set('eperiods', state.end_periods.join(','))
  } else {
    if (state.end_from) query.set('efrom', state.end_from)
    if (state.end_to) query.set('eto', state.end_to)
  }
  if (state.platforms.length) query.set('platforms', state.platforms.join(','))
  if (state.origin_lang.length) query.set('lang', state.origin_lang.join(','))
  if (state.producer_ids.length) query.set('producers', state.producer_ids.join(','))
  for (const group of normalizeTagGroups(state.tag_groups)) {
    query.append('tag_groups', encodeTagGroup(group))
  }
  if (state.staff_person_ids.length) query.set('staff', state.staff_person_ids.join(','))
  if (state.staff_role) query.set('staff_role', state.staff_role)
  if (state.include_dev) query.set('dev', '1')
  if (state.dev_status.length) query.set('status', state.dev_status.join(','))

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

function readReleaseBound(value: unknown): string | undefined {
  const raw = readString(value)?.trim()
  if (!raw) return undefined
  const match = RELEASE_BOUND_PATTERN.exec(raw)
  if (!match) return undefined

  const year = Number(match[1])
  return year >= 1900 && year <= 2200 ? raw : undefined
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

function readReleasePeriods(value: unknown): string[] {
  return [
    ...new Set(
      readStrings(value)
        .map(readReleaseBound)
        .filter((item): item is string => !!item),
    ),
  ].sort((a, b) => releaseStartKey(a).localeCompare(releaseStartKey(b)))
}

function orderReleaseBounds(
  from: string | undefined,
  to: string | undefined,
): [string | undefined, string | undefined] {
  if (!from || !to) return [from, to]

  return releaseStartKey(from) <= releaseStartKey(to) ? [from, to] : [to, from]
}

function releaseStartKey(value: string): string {
  return value.length === 4 ? `${value}-01` : value
}

function releaseBoundLabel(value: string): string {
  const year = value.slice(0, 4)
  if (value.length === 4) return `${year}年`

  return `${year}年${Number(value.slice(5, 7))}月`
}

function readBool(value: unknown): boolean {
  const raw = readString(value)
  return raw === '1' || raw === 'true'
}

function readDevStatuses(value: unknown): GalgameDevStatus[] {
  return [
    ...new Set(
      readStrings(value).filter((item): item is GalgameDevStatus =>
        DEV_STATUSES.includes(item as GalgameDevStatus),
      ),
    ),
  ]
}
