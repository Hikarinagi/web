import { resolveClientIp } from '../src/http/client-ip'

describe('resolveClientIp', () => {
  it('prefers cf-connecting-ip', () => {
    expect(
      resolveClientIp({
        ip: '127.0.0.1',
        headers: {
          'x-real-ip': '1.1.1.1',
          'cf-connecting-ip': '2.2.2.2',
          'x-forwarded-for': '3.3.3.3, 4.4.4.4',
        },
      }),
    ).toBe('2.2.2.2')
  })

  it('falls back to x-real-ip then x-forwarded-for then req.ip', () => {
    expect(
      resolveClientIp({
        ip: '127.0.0.1',
        headers: {
          'x-real-ip': '1.1.1.1',
          'x-forwarded-for': '3.3.3.3, 4.4.4.4',
        },
      }),
    ).toBe('1.1.1.1')

    expect(
      resolveClientIp({
        ip: '127.0.0.1',
        headers: {
          'x-forwarded-for': '3.3.3.3, 4.4.4.4',
        },
      }),
    ).toBe('3.3.3.3')

    expect(
      resolveClientIp({
        ip: '127.0.0.1',
        headers: {},
      }),
    ).toBe('127.0.0.1')
  })

  it('returns an empty string when no ip is available', () => {
    expect(resolveClientIp()).toBe('')
    expect(resolveClientIp({ headers: {} })).toBe('')
  })
})
