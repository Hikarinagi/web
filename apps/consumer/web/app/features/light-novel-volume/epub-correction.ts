import type { components } from '@hikarinagi/api-contract/v3'

export type EpubReview = components['schemas']['EpubReviewSummaryDto']
export type EpubReviewStatus = EpubReview['status']

export const TERMINAL_STATUSES: EpubReviewStatus[] = ['PASSED', 'REJECTED', 'NEEDS_HUMAN', 'FAILED']

export function isTerminalStatus(status: EpubReviewStatus | null | undefined): boolean {
  return status != null && TERMINAL_STATUSES.includes(status)
}
