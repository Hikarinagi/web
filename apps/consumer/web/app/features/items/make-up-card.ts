import makeUpCardUrl from '~/assets/images/make-up-card.webp'
import type { CheckInStatus } from '~/features/checkin/checkin'

export const MAKE_UP_CARD_NAME = '补签卡'
export const MAKE_UP_CARD_IMAGE = { src: makeUpCardUrl }

export function makeUpCardItem(card: CheckInStatus['make_up']['card'], windowDays: number) {
  return {
    name: MAKE_UP_CARD_NAME,
    description: `可补签最近 ${windowDays} 天内的漏签日`,
    image: MAKE_UP_CARD_IMAGE,
    price: card.next_price,
    details: [
      `持有 ${card.available} 张`,
      `本月已购买 ${card.purchased} / ${card.purchase_limit} 张`,
      `有效期 ${card.valid_days} 天`,
    ],
  }
}
