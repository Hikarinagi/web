import { SEARCH_TYPES, type SearchType } from '~/features/search/search'

export const SEARCH_PAGE_SIZE = 20

export interface SearchResultsState {
  q: string
  types: SearchType[]
  page: number
  page_size: number
}

function readString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}

function readTypes(value: unknown): SearchType[] {
  const tokens = Array.isArray(value) ? value.map(String) : (readString(value)?.split(',') ?? [])
  const seen = new Set<SearchType>()
  for (const token of tokens) {
    const trimmed = token.trim()
    if (SEARCH_TYPES.includes(trimmed as SearchType)) seen.add(trimmed as SearchType)
  }
  return [...seen]
}

function readPage(value: unknown): number {
  const n = Number(readString(value))
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function readSearchQuery(query: Record<string, unknown>): SearchResultsState {
  return {
    q: readString(query.q)?.trim() ?? '',
    types: readTypes(query.types),
    page: readPage(query.page),
    page_size: SEARCH_PAGE_SIZE,
  }
}

function buildSearchQuery(state: SearchResultsState): string {
  const query = new URLSearchParams()
  if (state.q) query.set('q', state.q)
  if (state.types.length && state.types.length < SEARCH_TYPES.length) {
    query.set('types', state.types.join(','))
  }
  if (state.page > 1) query.set('page', String(state.page))
  return query.toString()
}

export function searchBff(state: SearchResultsState): `/api/pages/${string}` {
  const qs = buildSearchQuery(state)
  return `/api/pages/search${qs ? `?${qs}` : ''}` as `/api/pages/${string}`
}

export function searchRoute(state: SearchResultsState): string {
  const qs = buildSearchQuery(state)
  return `/search${qs ? `?${qs}` : ''}`
}
