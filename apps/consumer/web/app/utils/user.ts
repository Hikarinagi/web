import type { components } from '@hikarinagi/api-contract/v3'

export interface NamedUser {
  name: string
  nickname?: string | null
}

export function displayName(user: NamedUser | null | undefined, fallback = '匿名用户'): string {
  return user ? user.nickname || user.name : fallback
}

export function isAutoUsername(name: string): boolean {
  return /^hikari_user_\d+$/.test(name)
}

export type EquippedBadge = components['schemas']['EquippedBadgeDto']
export type EquippedDecoration = components['schemas']['EquippedFrameDto']

export function badgesOf(
  user: { equipped_badges?: EquippedBadge[] | null } | null | undefined,
): EquippedDecoration[] {
  return user?.equipped_badges?.map(item => item.decoration) ?? []
}
