import makeUpCardUrl from '~/assets/images/make-up-card.webp'

export const MAKE_UP_CARD_NAME = '补签卡'
export const MAKE_UP_CARD_IMAGE = { src: makeUpCardUrl }

export function makeUpCardSummary(options: {
  windowDays: number
  validDays: number
  purchased: number
  purchaseLimit: number
}) {
  const { windowDays, validDays, purchased, purchaseLimit } = options
  return `可补签最近 ${windowDays} 天内的漏签日，有效期 ${validDays} 天。本月已购买 ${purchased} / ${purchaseLimit} 张。`
}
