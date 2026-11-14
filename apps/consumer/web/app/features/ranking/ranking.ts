import { dayLabel } from '~/features/landing/labels'

export type RankingPeriod = 'day' | 'week' | 'month'
export type RankingMedium = 'mangas' | 'light-novels'

export const RANKING_PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: 'day', label: '日榜' },
  { value: 'week', label: '周榜' },
  { value: 'month', label: '月榜' },
]

export function readRankingQuery(query: Record<string, unknown>): RankingPeriod {
  const raw = Array.isArray(query.period) ? query.period[0] : query.period
  return raw === 'day' || raw === 'month' ? raw : 'week'
}

function search(period: RankingPeriod) {
  return period === 'week' ? '' : `?period=${period}`
}

export function rankingBff(medium: RankingMedium, period: RankingPeriod): `/api/pages/${string}` {
  return `/api/pages/${medium}/ranking${search(period)}`
}

export function rankingRoute(medium: RankingMedium, period: RankingPeriod) {
  return `/${medium}/ranking${search(period)}`
}

export function rangeText(from: string, to: string) {
  return from === to ? dayLabel(to) : `${dayLabel(from)}至${dayLabel(to)}`
}
