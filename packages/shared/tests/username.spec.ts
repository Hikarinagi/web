import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  isReservedUsername,
  isValidUsername,
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
