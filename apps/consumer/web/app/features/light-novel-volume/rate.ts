import type { ApiData, ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type LightNovelVolumeRate = ApiData<'/api/v3/light-novel-volumes/{id}/rate', 'get'>
export type UpsertLightNovelVolumeRateBody = ApiRequestBody<
  '/api/v3/light-novel-volumes/{id}/rate',
  'put'
>
