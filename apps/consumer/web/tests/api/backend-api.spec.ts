import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const raw = vi.fn()
Object.assign(globalThis, { $fetch: { raw } })

function event(cookie?: string): H3Event {
  return {
    node: { req: { headers: cookie ? { cookie } : {} } },
    context: { nitro: { runtimeConfig: { apiBase: 'http://api.test/api/v3' } } },
  } as unknown as H3Event
}

function reply(status: number, body: unknown) {
  return { _data: body, headers: new Headers(), status }
}

const unauthenticated = reply(401, {
  success: false,
  error: { code: 'AUTH_UNAUTHENTICATED', message: '请先登录' },
  request_id: 'r1',
  timestamp: '2026-09-23T00:00:00.000Z',
})
const notFound = reply(404, {
  success: false,
  error: { code: 'WIKI_RESOURCE_NOT_FOUND', message: '资源不存在' },
  request_id: 'r2',
  timestamp: '2026-09-23T00:00:00.000Z',
})
const rate = reply(200, {
  success: true,
  data: { score: 8 },
  request_id: 'r3',
  timestamp: '2026-09-23T00:00:00.000Z',
})

async function load() {
  vi.resetModules()
  return import('../../server/utils/backend-api')
}

describe('fetchBackendData for guests', () => {
  beforeEach(() => {
    raw.mockReset()
  })

  it('asks the backend once per operation, then rejects the same operation locally', async () => {
    const { fetchBackendData, isBackendApiError } = await load()
    raw.mockResolvedValue(unauthenticated)

    const first = fetchBackendData(event(), '/api/v3/mangas/{id}/rate', { path: { id: 1 } })
    await expect(first).rejects.toSatisfy(error => isBackendApiError(error) && error.status === 401)
    const second = fetchBackendData(event(), '/api/v3/mangas/{id}/rate', { path: { id: 2 } })
    await expect(second).rejects.toSatisfy(
      error =>
        isBackendApiError(error) &&
        error.status === 401 &&
        (error.body as { error: { code: string } }).error.code === 'AUTH_UNAUTHENTICATED',
    )
    expect(raw).toHaveBeenCalledTimes(1)
  })

  it('keeps asking the backend for visitors who carry a session cookie', async () => {
    const { fetchBackendData } = await load()
    raw.mockResolvedValueOnce(unauthenticated).mockResolvedValueOnce(rate)

    await fetchBackendData(event(), '/api/v3/mangas/{id}/rate', { path: { id: 1 } }).catch(
      () => null,
    )
    const mine = await fetchBackendData(
      event('hikari_access_token=t'),
      '/api/v3/mangas/{id}/rate',
      {
        path: { id: 1 },
      },
    )
    expect(mine).toEqual({ score: 8 })
    expect(raw).toHaveBeenCalledTimes(2)
  })

  it('learns nothing from failures other than a missing session', async () => {
    const { fetchBackendData } = await load()
    raw.mockResolvedValue(notFound)

    await fetchBackendData(event(), '/api/v3/mangas/{id}', { path: { id: 1 } }).catch(() => null)
    await fetchBackendData(event(), '/api/v3/mangas/{id}', { path: { id: 1 } }).catch(() => null)
    expect(raw).toHaveBeenCalledTimes(2)
  })
})
