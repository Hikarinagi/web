import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DownloadManifest } from '~/features/download/engine/types'
import { fetchEntry } from '~/features/download/engine/fetcher'

const decrypt = vi.hoisted(() =>
  vi.fn(async (_aad: string, _key: string, encrypted: ArrayBuffer) => encrypted),
)

vi.mock('~/utils/media/file-crypto', () => ({
  createFileKey: () => 'key',
  decryptFile: decrypt,
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
    decrypt.mockReset()
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

  it('keeps the code and message of an error the backend answered in JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'DOWNLOAD_TASK_NOT_FOUND', message: '下载任务不存在' } }),
        { status: 404, headers: { 'content-type': 'application/json' } },
      ),
    )
    const error = await fetchEntry(manifest, file, entry, new AbortController().signal, {
      until: 0,
    }).catch((reason: unknown) => reason)
    expect(error).toMatchObject({ code: 'DOWNLOAD_TASK_NOT_FOUND', message: '下载任务不存在' })
    expect(error).toHaveProperty('fallback', undefined)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('names the status of a failed response that is not JSON, without retrying a client error', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html></html>', { status: 413, headers: { 'content-type': 'text/html' } }),
    )
    await expect(
      fetchEntry(manifest, file, entry, new AbortController().signal, { until: 0 }),
    ).rejects.toMatchObject({ code: 'HTTP_413', fallback: 'status', status: 413 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('asks for a refresh when Cloudflare stops the request for a check', async () => {
    fetchMock.mockResolvedValue(
      new Response('', { status: 403, headers: { 'cf-mitigated': 'challenge' } }),
    )
    await expect(
      fetchEntry(manifest, file, entry, new AbortController().signal, { until: 0 }),
    ).rejects.toMatchObject({ code: 'HTTP_403', fallback: 'challenge' })
  })

  it('reports a dropped connection as a network failure once the retries run out', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const result = fetchEntry(manifest, file, entry, new AbortController().signal, { until: 0 })
    const settled = expect(result).rejects.toMatchObject({
      code: 'NETWORK_FAILED',
      fallback: 'network',
    })
    await vi.advanceTimersByTimeAsync(7000)
    await settled
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('reports a file that fails to decrypt as an integrity failure once the retries run out', async () => {
    fetchMock.mockImplementation(async () => ok())
    decrypt.mockRejectedValue(new Error('tag mismatch'))
    const result = fetchEntry(manifest, file, entry, new AbortController().signal, { until: 0 })
    const settled = expect(result).rejects.toMatchObject({
      code: 'INTEGRITY_FAILED',
      fallback: 'integrity',
    })
    await vi.advanceTimersByTimeAsync(7000)
    await settled
    expect(decrypt).toHaveBeenCalledTimes(4)
  })

  it('passes an abort through untouched instead of reporting it as a network failure', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation(async () => {
      controller.abort(new DOMException('paused', 'AbortError'))
      throw controller.signal.reason
    })
    await expect(
      fetchEntry(manifest, file, entry, controller.signal, { until: 0 }),
    ).rejects.toMatchObject({ name: 'AbortError', message: 'paused' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
