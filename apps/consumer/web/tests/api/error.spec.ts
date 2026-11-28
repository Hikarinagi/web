import { describe, expect, it, vi } from 'vitest'
import { toast } from '@hina-ui/vue'
import {
  abortErrorOf,
  apiErrorMessage,
  isAbortError,
  isMaintenanceError,
  normalizeApiError,
  pageErrorMessage,
  showApiErrorToast,
} from '../../app/utils/api/error'

describe('showApiErrorToast', () => {
  it('shows the same failure once when several requests fail with it at the same time', () => {
    const danger = vi.spyOn(toast, 'danger').mockImplementation(() => '' as never)
    const failure = () =>
      normalizeApiError(
        Object.assign(new Error('[GET] "/api/v3/x": 502'), { status: 502, data: '<html></html>' }),
      )

    showApiErrorToast(failure())
    showApiErrorToast(failure())
    showApiErrorToast(failure())

    expect(danger).toHaveBeenCalledTimes(1)
    expect(danger).toHaveBeenCalledWith('服务暂时不可用，请稍后重试', { description: undefined })
    danger.mockRestore()
  })

  it('shows the reason a failure outside the contract carries, and the generic line only without one', () => {
    const danger = vi.spyOn(toast, 'danger').mockImplementation(() => '' as never)

    showApiErrorToast(normalizeApiError(new Error('文件内容无法识别')))
    showApiErrorToast(normalizeApiError({}))

    expect(danger).toHaveBeenNthCalledWith(1, '文件内容无法识别', { description: undefined })
    expect(danger).toHaveBeenNthCalledWith(2, '请求失败', { description: undefined })
    danger.mockRestore()
  })
})

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

  it('says in plain words what went wrong when the response is not the contract, a Cloudflare challenge among them', () => {
    const challenge = Object.assign(new Error('[GET] "/api/v3/x": 403'), {
      status: 403,
      data: '<!DOCTYPE html><title>Just a moment...</title>',
      response: { headers: new Headers({ 'cf-mitigated': 'challenge' }) },
    })
    const gateway = Object.assign(new Error('[GET] "/api/v3/x": 502'), {
      status: 502,
      data: '<html>Bad Gateway</html>',
    })

    expect(normalizeApiError(challenge)).toMatchObject({ status: 403, fallback: 'challenge' })
    expect(apiErrorMessage(normalizeApiError(challenge))).toBe('需要完成安全验证，请刷新页面')
    expect(normalizeApiError(gateway)).toMatchObject({ status: 502, fallback: 'network' })
    expect(apiErrorMessage(normalizeApiError(gateway))).toBe('服务暂时不可用，请稍后重试')
  })

  it('still surfaces the message for a code the frontend does not recognize', () => {
    const err = normalizeApiError(
      fetchError(422, {
        success: false,
        error: { code: 'POLL_LOCKED', message: '投票已有人参与，选项无法修改' },
        request_id: 'r2',
      }),
    )
    expect(err.message).toBe('投票已有人参与，选项无法修改')
    expect(err.status).toBe(422)
  })

  it('preserves SITE_MAINTENANCE details and identifies maintenance errors', () => {
    const err = normalizeApiError(
      fetchError(503, {
        success: false,
        error: {
          code: 'SITE_MAINTENANCE',
          message: '数据库维护中',
          retryable: true,
          details: {
            ends_at: '2026-11-14T15:00:00.000Z',
            telegram_url: 'https://t.me/hikari_nagi',
          },
        },
        request_id: 'r-maint',
      }),
    )
    expect(err.status).toBe(503)
    expect(err.code).toBe('SITE_MAINTENANCE')
    expect(err.details).toEqual({
      ends_at: '2026-11-14T15:00:00.000Z',
      telegram_url: 'https://t.me/hikari_nagi',
    })
    expect(isMaintenanceError(err)).toBe(true)
    expect(isMaintenanceError(normalizeApiError(fetchError(500, {})))).toBe(false)
  })
})

describe('apiErrorMessage', () => {
  it('shows the language pack text when the backend sent the default message for the code', () => {
    const err = normalizeApiError(
      fetchError(403, {
        success: false,
        error: { code: 'AUTH_FORBIDDEN', message: '没有权限执行该操作' },
        request_id: 'r3',
      }),
    )
    expect(apiErrorMessage(err)).toBe('没有权限执行该操作')
  })

  it('keeps a message the backend wrote for this one case', () => {
    const err = normalizeApiError(
      fetchError(400, {
        success: false,
        error: { code: 'COMMON_BAD_REQUEST', message: '高一档的处理不能比低一档宽松' },
        request_id: 'r4',
      }),
    )
    expect(apiErrorMessage(err)).toBe('高一档的处理不能比低一档宽松')
  })

  it('falls back to the language pack when the backend sent no message', () => {
    const err = normalizeApiError(
      fetchError(429, {
        success: false,
        error: { code: 'COMMON_RATE_LIMITED', message: '' },
        request_id: 'r5',
      }),
    )
    expect(apiErrorMessage(err)).toBe('请求过于频繁')
  })

  it('reads the same message back from a page error', () => {
    expect(
      pageErrorMessage({
        data: { code: 'COMMON_SERVICE_UNAVAILABLE', message: '', fallback: 'network' },
      }),
    ).toBe('服务暂时不可用，请稍后重试')
    expect(
      pageErrorMessage({
        data: { code: 'COMMON_UNEXPECTED_ERROR', message: '分片校验失败', fallback: 'unexpected' },
      }),
    ).toBe('分片校验失败')
    expect(pageErrorMessage({ data: { message: '没有业务码' } })).toBe('')
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
