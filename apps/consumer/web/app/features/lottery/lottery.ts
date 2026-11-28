import type { components } from '@hikarinagi/api-contract/v3'

export type BackendLottery = components['schemas']['LotteryDto']
export type BackendLotteryPrize = components['schemas']['LotteryPrizeDto']
export type BackendMyLotteryPrize = components['schemas']['MyLotteryPrizeDto']

export const MY_PRIZE_PAGE_SIZE = 20
