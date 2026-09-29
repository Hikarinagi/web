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

export type UsernameIssue = 'empty' | 'length' | 'charset' | 'digits' | 'reserved'

// The single username rule shared by the IdP, the API and every frontend form. Returns the
// first failing check so callers can show a specific message instead of a generic one.
export function usernameIssue(
  name: string,
  bounds: UsernameLengthBounds = {},
): UsernameIssue | null {
  const min = bounds.minLength ?? USERNAME_MIN_LENGTH
  const max = bounds.maxLength ?? USERNAME_MAX_LENGTH
  if (!name) return 'empty'
  if (name.length < min || name.length > max) return 'length'
  if (!USERNAME_PATTERN.test(name)) return 'charset'
  if (/^\d+$/.test(name)) return 'digits'
  if (isReservedUsername(name)) return 'reserved'
  return null
}

export function usernameIssueMessage(
  issue: UsernameIssue,
  bounds: UsernameLengthBounds = {},
): string {
  const min = bounds.minLength ?? USERNAME_MIN_LENGTH
  const max = bounds.maxLength ?? USERNAME_MAX_LENGTH
  switch (issue) {
    case 'empty':
      return '请输入用户名'
    case 'length':
      return `用户名长度须为 ${min} 到 ${max} 个字符`
    case 'charset':
      return '用户名只能包含字母、数字和下划线'
    case 'digits':
      return '用户名不能是纯数字'
    case 'reserved':
      return '该用户名不可用'
  }
}

// Message for the first failing check, or null when the name is acceptable.
export function usernameError(name: string, bounds: UsernameLengthBounds = {}): string | null {
  const issue = usernameIssue(name, bounds)
  return issue ? usernameIssueMessage(issue, bounds) : null
}

export function isValidUsername(name: string, bounds: UsernameLengthBounds = {}): boolean {
  return usernameIssue(name, bounds) === null
}
