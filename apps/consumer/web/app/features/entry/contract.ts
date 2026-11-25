import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendGameDisplay = ApiData<'/api/v3/galgames/{id}/display', 'get'>
export type BackendFactValue = ApiData<
  '/api/v3/galgames/{id}/facts',
  'get'
>[number]['values'][number]
export type BackendEntryHistory = ApiData<'/api/v3/galgames/{id}/history', 'get'>
export type BackendEntryComparison = ApiData<'/api/v3/galgames/{id}/comparison', 'get'>
