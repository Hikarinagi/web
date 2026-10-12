import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DownloadManifest } from '~/features/download/engine/types'
import { fetchEntry } from '~/features/download/engine/fetcher'

vi.mock('~/utils/media/file-crypto', () => ({
  createFileKey: () => 'key',
  decryptFile: async (_aad: string, _key: string, encrypted: ArrayBuffer) => encrypted,
}))

const body = new TextEncoder().encode('page')
const entry = {
  kind: 'page' as const,
  name: '0001.jpg',
  bytes: body.byteLength,
  page_id: 3,
  chapter_id: 7,
  mime_type: 'image/jpeg',
  data: null,
  index: null,
}
const file = { index: 0, name: '漫画.cbz', bytes: 0, container: 'zip' as const, entries: [entry] }
const manifest = { task_id: 1, series_id: 9, files: [file] } as unknown as DownloadManifest

const ok = () => new Response(body.slice(), { status: 200 })
const limited = (seconds: number | null) =>
  new Response(
    JSON.stringify({ error: { code: 'COMMON_RATE_LIMITED', message: '请求过于频繁' } }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        ...(seconds === null ? {} : { 'retry-after': String(seconds) }),
      },
    },
  )
const broken = () => new Response('', { status: 500 })

describe('fetchEntry', () => {
  const fetchMock = vi.fn<(input: string) => Promise<Response>>()

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('waits as long as the server asks when rate limited, without spending the retry budget', async () => {
    fetchMock
      .mockResolvedValueOnce(limited(2))
      .mockResolvedValueOnce(limited(2))
      .mockResolvedValueOnce(limited(2))
      .mockResolvedValueOnce(limited(2))
      .mockResolvedValueOnce(ok())
    const gate = { until: 0 }
    const result = fetchEntry(manifest, file, entry, new AbortController().signal, gate)

    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(gate.until).toBe(2000)
    await vi.advanceTimersByTimeAsync(1999)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(6000)

    await expect(result).resolves.toEqual(body)
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('holds every lane that shares the gate until the pause ends', async () => {
    fetchMock.mockResolvedValueOnce(limited(3)).mockImplementation(async () => ok())
    const gate = { until: 0 }
    const signal = new AbortController().signal
    const first = fetchEntry(manifest, file, entry, signal, gate)
    await vi.advanceTimersByTimeAsync(0)
    const second = fetchEntry(manifest, file, entry, signal, gate)
    await vi.advanceTimersByTimeAsync(2999)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    await expect(Promise.all([first, second])).resolves.toEqual([body, body])
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('falls back to a one second pause when the server gives no wait time', async () => {
    fetchMock.mockResolvedValueOnce(limited(null)).mockResolvedValueOnce(ok())
    const gate = { until: 0 }
    const result = fetchEntry(manifest, file, entry, new AbortController().signal, gate)
    await vi.advanceTimersByTimeAsync(0)
    expect(gate.until).toBe(1000)
    await vi.advanceTimersByTimeAsync(1000)
    await expect(result).resolves.toEqual(body)
  })

  it('still gives up on server errors after three retries', async () => {
    fetchMock.mockImplementation(async () => broken())
    const result = fetchEntry(manifest, file, entry, new AbortController().signal, { until: 0 })
    const settled = expect(result).rejects.toMatchObject({ code: 'HTTP_500' })
    await vi.advanceTimersByTimeAsync(7000)
    await settled
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
