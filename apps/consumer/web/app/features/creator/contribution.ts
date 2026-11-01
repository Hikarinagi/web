import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendChangeRequestList = ApiData<'/api/v3/change-requests', 'get'>
export type BackendChangeRequestSummary = BackendChangeRequestList['items'][number]
export type BackendChangeRequestDetail = ApiData<'/api/v3/change-requests/{id}', 'get'>

export type BackendContributionActivityItem = ApiData<
  '/api/v3/contribution/activity',
  'get'
>['items'][number]

export type BackendContributionStats = ApiData<'/api/v3/contribution/stats', 'get'>
