import type { ApiData } from '@hikarinagi/api-contract/v3'

export type PromoBanner = ApiData<'/api/v3/promotions/banners', 'get'>[number]
export type PromoNavItem = ApiData<'/api/v3/promotions/nav-items', 'get'>[number]

export function bannerForPosition<B>(
  index: number,
  banners: readonly B[],
  every: number,
): B | null {
  if (!banners.length || index <= 0 || index % every !== 0) return null
  return banners[(index / every - 1) % banners.length] ?? null
}
