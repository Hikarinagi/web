import { GALGAME_RATE_STATUS_CN } from '@hikarinagi/shared'
import type { ApiData, ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type GalgameRate = ApiData<'/api/v3/galgames/{id}/rate', 'get'>
export type GalgameRateStats = ApiData<'/api/v3/galgames/{id}/rates/statistics', 'get'>
export type UpsertGalgameRateBody = ApiRequestBody<'/api/v3/galgames/{id}/rate', 'put'>
export type GalgameRateStatus = Exclude<GalgameRate['status'], null>
export type GalgameRateList = ApiData<'/api/v3/galgames/{id}/rates', 'get'>
export type GalgameRateListItem = GalgameRateList['items'][number]
export type GalgameRateKeyword = ApiData<
  '/api/v3/galgames/{id}/rates/keywords',
  'get'
>['keywords'][number]

export const RATE_HIGHLY_RATED_LIKES = 20

export const GALGAME_STATUS_ORDER: readonly GalgameRateStatus[] = [
  'PLAN',
  'GOING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
]

export const GALGAME_STATUS_LABEL = GALGAME_RATE_STATUS_CN

export const GALGAME_STATUS_SUB: Record<GalgameRateStatus, string> = {
  PLAN: '之后再玩',
  GOING: '正在玩',
  COMPLETED: '推完了',
  ON_HOLD: '先放一下',
  DROPPED: '不玩了',
}

export const GALGAME_RATE_DIMENSIONS = [
  { key: 'rate_scenario', label: '剧本' },
  { key: 'rate_direction', label: '演出' },
  { key: 'rate_music', label: '音乐' },
  { key: 'rate_visual', label: 'CG' },
  { key: 'rate_character', label: '角色' },
  { key: 'rate_system', label: '系统' },
] as const satisfies ReadonlyArray<{ key: keyof UpsertGalgameRateBody; label: string }>

export type RateTierTone = 'hot' | 'good' | 'mid' | 'low'
export interface RateTier {
  label: string
  tone: RateTierTone
}

export const RATE_TIER_MIN_RATERS = 5

export function rateTier(average: number | null, ratedCount: number): RateTier | null {
  if (average == null || ratedCount < RATE_TIER_MIN_RATERS) return null
  if (average >= 9) return { label: '神', tone: 'hot' }
  if (average >= 8) return { label: '佳作', tone: 'hot' }
  if (average >= 7) return { label: '还不错', tone: 'good' }
  if (average >= 6) return { label: '中规中矩', tone: 'mid' }
  if (average >= 5) return { label: '一般般', tone: 'mid' }
  if (average >= 4) return { label: '略雷', tone: 'low' }
  return { label: '什么玩意', tone: 'low' }
}
