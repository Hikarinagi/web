import { readPageQuery } from '#shared/utils/query'

export const PERSON_PAGE_SIZE = 48

export type PersonOrder = 'new' | 'old'

export interface PersonListState {
  tab: string | null
  order: PersonOrder
  page: number
}

function readString(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw ? raw : null
}

export function readPersonQuery(query: Record<string, unknown>): PersonListState {
  return {
    tab: readString(query.tab),
    order: readString(query.sort) === 'old' ? 'old' : 'new',
    page: readPageQuery(query),
  }
}

export function defaultPersonTab(stats: { voices: number; roles: { code: string }[] }) {
  if (stats.voices) return 'VOICE'
  return stats.roles.length > 1 ? 'ALL' : (stats.roles[0]?.code ?? 'ALL')
}

export function samePersonState(a: PersonListState, b: PersonListState) {
  return a.tab === b.tab && a.order === b.order && a.page === b.page
}

function buildQuery(state: PersonListState) {
  const query = new URLSearchParams()
  if (state.tab) query.set('tab', state.tab)
  if (state.order === 'old') query.set('sort', 'old')
  if (state.page > 1) query.set('page', String(state.page))
  const text = query.toString()
  return text ? `?${text}` : ''
}

export function personBff(id: number, state: PersonListState) {
  return `/api/pages/people/${id}${buildQuery(state)}` as `/api/pages/${string}`
}

export function personListBff(id: number, state: PersonListState) {
  return `/api/pages/people/${id}/works${buildQuery(state)}` as `/api/pages/${string}`
}

export function personRoute(id: number, state: PersonListState) {
  return `/people/${id}${buildQuery(state)}`
}
