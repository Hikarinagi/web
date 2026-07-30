import type { CurrentUser } from './auth'

export type EquippedFrame = NonNullable<CurrentUser['equipped_frame']>

export interface UserIdentity {
  id?: number
  name: string
  avatar?: { src: string } | null
  equipped_frame?: EquippedFrame | null
}

export type UserAvatarData = CurrentUser | UserIdentity
