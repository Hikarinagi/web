export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

// Complexity is a fixed contract: upper case, lower case, and at least a digit or a symbol.
// Only the length bounds are tunable per deployment (IdP settings), which is why the checks
// take bounds while the pattern does not.
export const PASSWORD_PATTERN = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/

export interface PasswordLengthBounds {
  minLength?: number
  maxLength?: number
}

export type PasswordIssue = 'empty' | 'length' | 'complexity'

export function passwordIssue(
  password: string,
  bounds: PasswordLengthBounds = {},
): PasswordIssue | null {
  const min = bounds.minLength ?? PASSWORD_MIN_LENGTH
  const max = bounds.maxLength ?? PASSWORD_MAX_LENGTH
  if (!password) return 'empty'
  if (password.length < min || password.length > max) return 'length'
  if (!PASSWORD_PATTERN.test(password)) return 'complexity'
  return null
}

export function passwordIssueMessage(
  issue: PasswordIssue,
  bounds: PasswordLengthBounds = {},
): string {
  const min = bounds.minLength ?? PASSWORD_MIN_LENGTH
  const max = bounds.maxLength ?? PASSWORD_MAX_LENGTH
  switch (issue) {
    case 'empty':
      return '请输入密码'
    case 'length':
      return `密码长度须为 ${min} 到 ${max} 位`
    case 'complexity':
      return '密码需包含大小写字母，以及数字或符号'
  }
}

// Message for the first failing check, or null when the password is acceptable.
export function passwordError(password: string, bounds: PasswordLengthBounds = {}): string | null {
  const issue = passwordIssue(password, bounds)
  return issue ? passwordIssueMessage(issue, bounds) : null
}

export function isValidPassword(password: string, bounds: PasswordLengthBounds = {}): boolean {
  return passwordIssue(password, bounds) === null
}
