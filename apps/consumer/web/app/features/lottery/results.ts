import { MY_PRIZE_PAGE_SIZE } from './lottery'

export interface PrizeResultsState {
  page: number
  page_size: number
}

function readPage(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(typeof raw === 'string' ? raw : undefined)
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function readPrizeQuery(query: Record<string, unknown>): PrizeResultsState {
  return { page: readPage(query.page), page_size: MY_PRIZE_PAGE_SIZE }
}

function buildQuery(state: PrizeResultsState): string {
  return state.page > 1 ? `page=${state.page}` : ''
}

export function prizeBff(state: PrizeResultsState): `/api/pages/${string}` {
  const qs = buildQuery(state)
  return `/api/pages/me/prizes${qs ? `?${qs}` : ''}` as `/api/pages/${string}`
}

export function prizeRoute(state: PrizeResultsState): string {
  const qs = buildQuery(state)
  return `/me/prizes${qs ? `?${qs}` : ''}`
}
