import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  isReservedUsername,
  isValidUsername,
  usernameError,
  usernameIssue,
  usernameIssueMessage,
} from '../src/validation/username'

describe('isValidUsername', () => {
  it('accepts plain ascii handles', () => {
    expect(isValidUsername('keiko')).toBe(true)
    expect(isValidUsername('user_123')).toBe(true)
    expect(isValidUsername('ABC')).toBe(true)
    expect(isValidUsername('a_b_c')).toBe(true)
  })

  it('enforces the default length bounds', () => {
    expect(isValidUsername('ab')).toBe(false)
    expect(isValidUsername('a'.repeat(USERNAME_MIN_LENGTH))).toBe(true)
    expect(isValidUsername('a'.repeat(USERNAME_MAX_LENGTH))).toBe(true)
    expect(isValidUsername('a'.repeat(USERNAME_MAX_LENGTH + 1))).toBe(false)
  })

  it('rejects non-ascii and special characters', () => {
    expect(isValidUsername('用户名一二')).toBe(false)
    expect(isValidUsername('bad-name')).toBe(false)
    expect(isValidUsername('has space')).toBe(false)
    expect(isValidUsername('with.dot')).toBe(false)
    expect(isValidUsername('emoji😀x')).toBe(false)
  })

  it('rejects all-digit handles but accepts mixed', () => {
    expect(isValidUsername('123456')).toBe(false)
    expect(isValidUsername('1a2345')).toBe(true)
  })

  it('rejects reserved names and the generated namespace', () => {
    expect(isValidUsername('admin')).toBe(false)
    expect(isValidUsername('ADMIN')).toBe(false)
    expect(isValidUsername('hikari')).toBe(false)
    expect(isValidUsername('hikari_user_42')).toBe(false)
    expect(isValidUsername('hikari_user_cool')).toBe(true)
  })

  it('honors custom length bounds', () => {
    expect(isValidUsername('ab', { minLength: 2 })).toBe(true)
    expect(isValidUsername('abcd', { maxLength: 3 })).toBe(false)
  })
})

describe('usernameIssue', () => {
  it('names the first failing check in rule order', () => {
    expect(usernameIssue('')).toBe('empty')
    expect(usernameIssue('ab')).toBe('length')
    expect(usernameIssue('a'.repeat(USERNAME_MAX_LENGTH + 1))).toBe('length')
    expect(usernameIssue('bad-name')).toBe('charset')
    expect(usernameIssue('2778730690')).toBe('digits')
    expect(usernameIssue('support')).toBe('reserved')
    expect(usernameIssue('hikari_user_7')).toBe('reserved')
    expect(usernameIssue('keiko')).toBeNull()
  })

  it('reports length against custom bounds', () => {
    expect(usernameIssue('ab', { minLength: 2 })).toBeNull()
    expect(usernameIssue('abcd', { maxLength: 3 })).toBe('length')
  })
})

describe('usernameIssueMessage / usernameError', () => {
  it('spells the configured bounds into the length message', () => {
    expect(usernameIssueMessage('length')).toBe(
      `用户名长度须为 ${USERNAME_MIN_LENGTH} 到 ${USERNAME_MAX_LENGTH} 个字符`,
    )
    expect(usernameIssueMessage('length', { minLength: 4, maxLength: 16 })).toBe(
      '用户名长度须为 4 到 16 个字符',
    )
  })

  it('returns the message for a bad name and null for a good one', () => {
    expect(usernameError('2778730690')).toBe('用户名不能是纯数字')
    expect(usernameError('admin')).toBe('该用户名不可用')
    expect(usernameError('bad-name')).toBe('用户名只能包含字母、数字和下划线')
    expect(usernameError('')).toBe('请输入用户名')
    expect(usernameError('keiko')).toBeNull()
  })
})

describe('isReservedUsername', () => {
  it('flags reserved words case-insensitively', () => {
    expect(isReservedUsername('Root')).toBe(true)
    expect(isReservedUsername('api')).toBe(true)
    expect(isReservedUsername('keiko')).toBe(false)
  })

  it('flags the hikari_user_<digits> namespace only', () => {
    expect(isReservedUsername('hikari_user_1')).toBe(true)
    expect(isReservedUsername('HIKARI_USER_99')).toBe(true)
    expect(isReservedUsername('hikari_user_x')).toBe(false)
  })
})
