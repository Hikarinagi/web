import { describe, expect, it } from 'vitest'
import { abortErrorOf, isAbortError, normalizeApiError } from '../../app/utils/api/error'

function fetchError(status: number, body: unknown) {
  return Object.assign(new Error(`[PATCH] "/x": ${status}`), { status, data: body })
}

describe('normalizeApiError', () => {
  it('surfaces the backend message for a known biz code', () => {
    const err = normalizeApiError(
      fetchError(422, {
        success: false,
        error: { code: 'COMMON_VALIDATION_FAILED', message: '校验失败' },
        request_id: 'r1',
      }),
    )
    expect(err.code).toBe('COMMON_VALIDATION_FAILED')
    expect(err.message).toBe('校验失败')
  })

  it('still surfaces the message for a code the frontend does not recognize', () => {
    const err = normalizeApiError(
      fetchError(422, {
        success: false,
        error: { code: 'POLL_LOCKED', message: '投票已有人参与,选项无法修改' },
        request_id: 'r2',
      }),
    )
    expect(err.message).toBe('投票已有人参与,选项无法修改')
    expect(err.status).toBe(422)
  })
})

describe('abortErrorOf / isAbortError', () => {
  it('detects a raw DOMException AbortError and returns it unchanged', () => {
    const abort = new DOMException('AsyncData request cancelled by deduplication', 'AbortError')
    const found = abortErrorOf(abort)
    // 必须原样返回那个 DOMException —— 上游靠 `instanceof DOMException` 让 Nuxt 走 graceful 分支。
    expect(found).toBe(abort)
    expect(found).toBeInstanceOf(DOMException)
    expect(isAbortError(abort)).toBe(true)
  })

  it('detects a plain object whose name is AbortError', () => {
    const err = { name: 'AbortError', message: 'aborted' }
    expect(abortErrorOf(err)).toBe(err)
    expect(isAbortError(err)).toBe(true)
  })

  it('unwraps an ofetch-style wrapper and returns the inner AbortError', () => {
    const abort = new DOMException('aborted', 'AbortError')
    const wrapped = Object.assign(new Error('fetch failed'), { name: 'FetchError', cause: abort })
    const found = abortErrorOf(wrapped)
    expect(found).toBe(abort)
    expect(found).toBeInstanceOf(DOMException)
  })

  it('walks a deeper cause chain', () => {
    const abort = new DOMException('aborted', 'AbortError')
    const wrapped = { name: 'Outer', cause: { name: 'Inner', cause: abort } }
    expect(abortErrorOf(wrapped)).toBe(abort)
  })

  it('returns null for non-abort errors', () => {
    expect(abortErrorOf(new Error('boom'))).toBeNull()
    expect(abortErrorOf({ name: 'TypeError' })).toBeNull()
    expect(abortErrorOf({ response: { status: 500 } })).toBeNull()
    expect(isAbortError(new Error('boom'))).toBe(false)
  })

  it('handles null/undefined and self-referential cause without looping', () => {
    expect(abortErrorOf(null)).toBeNull()
    expect(abortErrorOf(undefined)).toBeNull()
    const cyclic: Record<string, unknown> = { name: 'X' }
    cyclic.cause = cyclic
    expect(abortErrorOf(cyclic)).toBeNull()
  })
})
