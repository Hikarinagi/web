import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendReviewGroupApplicationList = ApiData<'/api/v3/review-group-applications', 'get'>
export type BackendReviewGroupApplicationSummary =
  BackendReviewGroupApplicationList['items'][number]
export type BackendReviewGroupApplication = ApiData<'/api/v3/review-group-applications/{id}', 'get'>
export type BackendMyReviewGroupApplicationList = ApiData<
  '/api/v3/user/me/review-group-applications',
  'get'
>
export type BackendMyReviewGroupApplication = BackendMyReviewGroupApplicationList['items'][number]
export type BackendReviewGroupCandidate = ApiData<
  '/api/v3/user/me/review-group-applications/groups',
  'get'
>['items'][number]
