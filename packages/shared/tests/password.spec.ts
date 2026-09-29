import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidPassword,
  passwordError,
  passwordIssue,
  passwordIssueMessage,
} from '../src/validation/password'

describe('passwordIssue', () => {
  it('accepts a password with upper, lower and a digit or symbol', () => {
    expect(passwordIssue('Passw0rd')).toBeNull()
    expect(passwordIssue('Password!')).toBeNull()
    expect(passwordIssue('E2ePassw0rd!ok')).toBeNull()
  })

  it('names the first failing check in rule order', () => {
    expect(passwordIssue('')).toBe('empty')
    expect(passwordIssue('Ab1')).toBe('length')
    expect(passwordIssue(`A1${'a'.repeat(PASSWORD_MAX_LENGTH)}`)).toBe('length')
    expect(passwordIssue('password1')).toBe('complexity')
    expect(passwordIssue('PASSWORD1')).toBe('complexity')
    expect(passwordIssue('Passwordonly')).toBe('complexity')
  })

  it('honors custom length bounds', () => {
    expect(passwordIssue('Ab1', { minLength: 3 })).toBeNull()
    expect(passwordIssue('Passw0rd', { maxLength: 6 })).toBe('length')
  })
})

describe('passwordIssueMessage / passwordError / isValidPassword', () => {
  it('spells the configured bounds into the length message', () => {
    expect(passwordIssueMessage('length')).toBe(
      `密码长度须为 ${PASSWORD_MIN_LENGTH} 到 ${PASSWORD_MAX_LENGTH} 位`,
    )
    expect(passwordIssueMessage('length', { minLength: 10, maxLength: 64 })).toBe(
      '密码长度须为 10 到 64 位',
    )
  })

  it('returns the message for a bad password and null for a good one', () => {
    expect(passwordError('')).toBe('请输入密码')
    expect(passwordError('password1')).toBe('密码需包含大小写字母，以及数字或符号')
    expect(passwordError('Passw0rd')).toBeNull()
    expect(isValidPassword('Passw0rd')).toBe(true)
    expect(isValidPassword('password')).toBe(false)
  })
})
