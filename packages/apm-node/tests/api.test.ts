import { describe, expect, it } from 'vitest'

import { captureError, errorParts, failSpan, log, track } from '../src/api'

describe('api entry', () => {
  it('is a safe no-op before any sdk is registered', () => {
    expect(() => {
      track('user.registered', { 'user.id': '1' })
      captureError(new Error('boom'))
      log('warn', 'careful')
      failSpan(new Error('nope'))
    }).not.toThrow()
  })

  it('describes errors of any shape', () => {
    expect(errorParts(new RangeError('bad'))).toMatchObject({ type: 'RangeError', message: 'bad' })
    expect(errorParts('plain')).toEqual({ type: 'Error', message: 'plain' })
    expect(errorParts({ code: 7 })).toEqual({ type: 'Error', message: '{"code":7}' })
  })
})
