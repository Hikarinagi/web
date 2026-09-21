import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { reportServerError } from '../../server/utils/apm-errors'

const failSpan = vi.fn()

vi.mock('@hikarinagi/apm-node/api', () => ({
  failSpan: (...args: unknown[]) => failSpan(...args),
}))

const event = { path: '/login?redirect_to=%2F', method: 'GET' } as H3Event

describe('reportServerError', () => {
  beforeEach(() => {
    failSpan.mockClear()
  })

  it('marks the active span with the underlying cause of a 5xx', () => {
    const cause = new Error("Cannot find module 'valibot/dist/index.cjs'")
    const error = Object.assign(new Error('Server Error'), { statusCode: 500, cause })
    expect(reportServerError(error, event)).toBe(true)
    expect(failSpan).toHaveBeenCalledWith(cause, {
      'http.response.status_code': 500,
      'url.path': '/login',
      'http.request.method': 'GET',
    })
  })

  it('treats errors without a status as 500 and works without an event', () => {
    const error = new TypeError('boom')
    expect(reportServerError(error)).toBe(true)
    expect(failSpan).toHaveBeenCalledWith(error, { 'http.response.status_code': 500 })
  })

  it('ignores client errors such as a 404 page', () => {
    expect(reportServerError(Object.assign(new Error('nope'), { statusCode: 404 }), event)).toBe(
      false,
    )
    expect(failSpan).not.toHaveBeenCalled()
  })
})
