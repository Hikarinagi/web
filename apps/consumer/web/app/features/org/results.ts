import { readPageQuery } from '#shared/utils/query'
import type { OrgMode } from './works'

export const ORG_PAGE_SIZE = 48
export const HUB_RECENT = 18

export type OrgSort = 'new' | 'old' | 'rating'
export type OrgMedia = 'novel' | 'manga'

export interface OrgListState {
  tab: string
  sort: OrgSort
  year: number | null
  media: OrgMedia | null
  status: string
  page: number
}

function readString(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw ? raw : null
}

export function readOrgQuery(query: Record<string, unknown>): OrgListState {
  const sort = readString(query.sort)
  const media = readString(query.media)
  const year = Number(readString(query.year))
  return {
    tab: readString(query.tab) ?? 'ALL',
    sort: sort === 'old' || sort === 'rating' ? sort : 'new',
    year: Number.isInteger(year) && year > 0 ? year : null,
    media: media === 'novel' || media === 'manga' ? media : null,
    status: readString(query.status) ?? 'ALL',
    page: readPageQuery(query),
  }
}

export function sameOrgState(a: OrgListState, b: OrgListState) {
  return (
    a.tab === b.tab &&
    a.sort === b.sort &&
    a.year === b.year &&
    a.media === b.media &&
    a.status === b.status &&
    a.page === b.page
  )
}

function buildQuery(state: OrgListState, mode?: OrgMode) {
  const query = new URLSearchParams()
  if (mode) query.set('mode', mode)
  if (state.tab !== 'ALL') query.set('tab', state.tab)
  if (state.sort !== 'new') query.set('sort', state.sort)
  if (state.year) query.set('year', String(state.year))
  if (state.media) query.set('media', state.media)
  if (state.status !== 'ALL') query.set('status', state.status)
  if (state.page > 1) query.set('page', String(state.page))
  const text = query.toString()
  return text ? `?${text}` : ''
}

export function orgBff(id: number, state: OrgListState) {
  return `/api/pages/producers/${id}${buildQuery(state)}` as `/api/pages/${string}`
}

export function orgListBff(id: number, mode: OrgMode, state: OrgListState) {
  return `/api/pages/producers/${id}/works${buildQuery(state, mode)}` as `/api/pages/${string}`
}

export function orgRoute(id: number, state: OrgListState) {
  return `/producers/${id}${buildQuery(state)}`
}
