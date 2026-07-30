export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  'admin',
  'root',
  'api',
  'me',
  'system',
  'official',
  'hikari',
  'hikarinagi',
  'support',
  'help',
  'settings',
])

// `hikari_user_<digits>` is the namespace the migration assigns to users whose legacy
// name failed this rule; reserve it so no one can claim or collide with a generated handle.
export function isReservedUsername(name: string): boolean {
  if (RESERVED_USERNAMES.has(name.toLowerCase())) return true
  return /^hikari_user_\d+$/i.test(name)
}

export interface UsernameLengthBounds {
  minLength?: number
  maxLength?: number
}

export function isValidUsername(name: string, bounds: UsernameLengthBounds = {}): boolean {
  const min = bounds.minLength ?? USERNAME_MIN_LENGTH
  const max = bounds.maxLength ?? USERNAME_MAX_LENGTH
  if (name.length < min || name.length > max) return false
  if (!USERNAME_PATTERN.test(name)) return false
  if (/^\d+$/.test(name)) return false
  return !isReservedUsername(name)
}
