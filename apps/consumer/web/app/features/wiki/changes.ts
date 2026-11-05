import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type WikiChange = ApiData<'/api/v3/wiki/changes', 'get'>['items'][number]
export type RevisionComparison = components['schemas']['RevisionComparisonDto']
export type EditBasis = components['schemas']['EditBasisDto']

export function changeLines(
  change: Pick<WikiChange, 'summary' | 'entries'>,
): { entry: string | null; text: string }[] {
  const parts = change.entries.filter(entry => entry.summary)
  if (new Set(parts.map(entry => entry.summary)).size < 2)
    return [{ entry: null, text: change.summary }]
  return parts.map(entry => ({ entry: entry.label, text: entry.summary ?? '' }))
}

export function shownEntries<T extends { type: string }>(entries: T[]): T[] {
  return entries.filter(entry => entry.type !== 'CHARACTER')
}

export function changeTitle(change: Pick<WikiChange, 'entries'>): string {
  const labels = shownEntries(change.entries).map(entry => entry.label || '未命名')
  return labels.length > 3
    ? `${labels.slice(0, 3).join('、')}等 ${labels.length} 个条目`
    : labels.join('、')
}

export const CHANGE_FILTERS = ['all', 'unchecked', 'mine', 'watched'] as const
export type ChangeFilter = (typeof CHANGE_FILTERS)[number]

export const CHANGE_TITLES: Record<ChangeFilter, string> = {
  all: '全部修改',
  unchecked: '未检查的修改',
  mine: '我的修改',
  watched: '我关注的',
}

export const CHANGES_PAGE_SIZE = 30

export interface ChangesState {
  f: ChangeFilter
  page: number
  page_size: number
}

function readString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}

export function readChangesQuery(query: Record<string, unknown>): ChangesState {
  const f = readString(query.f)
  const page = Number(readString(query.page))
  return {
    f: CHANGE_FILTERS.includes(f as ChangeFilter) ? (f as ChangeFilter) : 'all',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    page_size: CHANGES_PAGE_SIZE,
  }
}

export function changesQuery(state: Pick<ChangesState, 'f' | 'page'>): Record<string, string> {
  return {
    ...(state.f === 'all' ? {} : { f: state.f }),
    ...(state.page > 1 ? { page: String(state.page) } : {}),
  }
}

function search(state: ChangesState): string {
  const query = new URLSearchParams(changesQuery(state)).toString()
  return query ? `?${query}` : ''
}

export function changesBff(state: ChangesState): `/api/pages/${string}` {
  return `/api/pages/create/wiki/changes${search(state)}` as `/api/pages/${string}`
}

export function changesRoute(state: ChangesState, edit?: number): string {
  return `/create/wiki/changes${edit ? `/${edit}` : ''}${search(state)}`
}
