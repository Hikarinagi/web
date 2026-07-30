import type { ApiData, ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type LightNovelRate = ApiData<'/api/v3/light-novels/{id}/rate', 'get'>
export type LightNovelRateStats = ApiData<'/api/v3/light-novels/{id}/rates/statistics', 'get'>
export type UpsertLightNovelRateBody = ApiRequestBody<'/api/v3/light-novels/{id}/rate', 'put'>
export type LightNovelRateStatus = Exclude<LightNovelRate['status'], null>
export type LightNovelRateList = ApiData<'/api/v3/light-novels/{id}/rates', 'get'>
export type LightNovelRateListItem = LightNovelRateList['items'][number]
export type LightNovelRateKeyword = ApiData<
  '/api/v3/light-novels/{id}/rates/keywords',
  'get'
>['keywords'][number]

export {
  rateTier,
  RATE_HIGHLY_RATED_LIKES,
  type RateTier,
  type RateTierTone,
} from '~/features/galgame/rate'

export const LIGHT_NOVEL_STATUS_ORDER: readonly LightNovelRateStatus[] = [
  'PLAN',
  'GOING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
]

export const LIGHT_NOVEL_STATUS_LABEL: Record<LightNovelRateStatus, string> = {
  PLAN: '想读',
  GOING: '在读',
  COMPLETED: '读完',
  ON_HOLD: '搁置',
  DROPPED: '弃读',
}

export const LIGHT_NOVEL_STATUS_SUB: Record<LightNovelRateStatus, string> = {
  PLAN: '之后再读',
  GOING: '正在读',
  COMPLETED: '读完了',
  ON_HOLD: '先放一下',
  DROPPED: '不读了',
}

export const LIGHT_NOVEL_RATE_DIMENSIONS = [
  { key: 'rate_plot', label: '剧情' },
  { key: 'rate_character', label: '角色' },
  { key: 'rate_writing', label: '文笔' },
  { key: 'rate_worldview', label: '世界观' },
  { key: 'rate_pacing', label: '节奏' },
  { key: 'rate_illustration', label: '插画' },
] as const satisfies ReadonlyArray<{ key: keyof UpsertLightNovelRateBody; label: string }>
