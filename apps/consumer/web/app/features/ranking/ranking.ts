import type { ApiData } from '@hikarinagi/api-contract/v3'
import { dayLabel } from '~/features/landing/labels'

export type RankingPeriod = 'day' | 'week' | 'month'
export type RankingMedium = 'mangas' | 'light-novels'
export type BackendMangaRankingItem = ApiData<
  '/api/v3/landing/mangas/ranking',
  'get'
>['items'][number]
export type BackendNovelRankingItem = ApiData<
  '/api/v3/landing/light-novels/ranking',
  'get'
>['items'][number]

export const RANKING_PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: 'day', label: '日榜' },
  { value: 'week', label: '周榜' },
  { value: 'month', label: '月榜' },
]

export const RANKING_MEDIUMS: { value: RankingMedium; label: string }[] = [
  { value: 'mangas', label: '漫画' },
  { value: 'light-novels', label: '轻小说' },
]

export const RANKING_LEAD = 5

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
  const year = (date: string) => `${Number(date.slice(0, 4))} 年 `
  if (from === to) return `${year(to)}${dayLabel(to)}`
  const end = from.slice(0, 4) === to.slice(0, 4) ? dayLabel(to) : `${year(to)}${dayLabel(to)}`
  return `${year(from)}${dayLabel(from)}至 ${end}`
}
