import { afterEach, describe, expect, it, vi } from 'vitest'
import { readApiBinary } from '../../app/utils/api/binary'
import { hikariRequest } from '../../app/utils/api/hikari-request'

function binary(chunks: number[][]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(Uint8Array.from(chunk)))
      controller.close()
    },
  })
}

describe('binary API requests', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns whole bytes and download progress', async () => {
    const progress = vi.fn()
    const result = await readApiBinary(
      {
        status: 200,
        headers: new Headers({ 'content-length': '5' }),
        _data: binary([
          [1, 2],
          [3, 4, 5],
        ]),
      },
      progress,
    )
    expect([...new Uint8Array(result)]).toEqual([1, 2, 3, 4, 5])
    expect(progress.mock.calls.map(([value]) => value)).toEqual([
      { loaded: 0, total: 5 },
      { loaded: 2, total: 5 },
      { loaded: 5, total: 5 },
    ])
  })

  it('preserves structured errors instead of saving them as EPUB', async () => {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: 'DOWNLOAD_CARD_UNAVAILABLE', message: '没有可用的下载卡' },
        request_id: 'binary-test',
        timestamp: '2026-09-27T00:00:00.000Z',
      }),
      { headers: { 'content-type': 'application/json' }, status: 409 },
    )
    await expect(
      readApiBinary({
        status: response.status,
        headers: response.headers,
        _data: response.body!,
      }),
    ).rejects.toMatchObject({ code: 'DOWNLOAD_CARD_UNAVAILABLE', status: 409 })
  })

  it('does not produce a partial file after a network failure', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error('connection lost'))
      },
    })
    await expect(
      readApiBinary({ status: 200, headers: new Headers(), _data: stream }),
    ).rejects.toThrow('connection lost')
  })

  it('keeps credentials and path interpolation in the unified request utility', async () => {
    const raw = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      _data: binary([[1, 2, 3]]),
    })
    vi.stubGlobal('useNuxtApp', () => ({ $hikariFetch: { raw } }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '/api/v3' } }))
    const result = await hikariRequest('/api/v3/reader/sessions/{id}/content', {
      method: 'GET',
      path: { id: 'session' },
      responseType: 'arrayBuffer',
    })
    expect([...new Uint8Array(result)]).toEqual([1, 2, 3])
    expect(raw).toHaveBeenCalledWith(
      '/reader/sessions/session/content',
      expect.objectContaining({
        credentials: 'include',
        responseType: 'stream',
        ignoreResponseError: true,
        retry: false,
      }),
    )
  })

  it('decodes binary responses without forwarding the decoder to fetch', async () => {
    const raw = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      _data: binary([[1, 2, 3]]),
    })
    vi.stubGlobal('useNuxtApp', () => ({ $hikariFetch: { raw } }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '/api/v3' } }))
    const decode = vi.fn().mockResolvedValue(Uint8Array.from([4, 5]).buffer)
    const result = await hikariRequest('/api/v3/reader/sessions/{id}/content', {
      path: { id: 'session' },
      method: 'GET',
      responseType: 'arrayBuffer',
      decodeBinary: decode,
    })
    expect([...new Uint8Array(result)]).toEqual([4, 5])
    expect([...new Uint8Array(decode.mock.calls[0][0])]).toEqual([1, 2, 3])
    expect(raw.mock.calls[0][1]).not.toHaveProperty('decodeBinary')
  })

  it('handles decryption errors through the request error contract', async () => {
    const raw = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      _data: binary([[1, 2, 3]]),
    })
    vi.stubGlobal('useNuxtApp', () => ({ $hikariFetch: { raw } }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '/api/v3' } }))
    await expect(
      hikariRequest('/api/v3/reader/sessions/{id}/content', {
        path: { id: 'session' },
        method: 'GET',
        responseType: 'arrayBuffer',
        decodeBinary: () => Promise.reject(new Error('文件校验失败，请重新加载')),
        toast: false,
      }),
    ).rejects.toMatchObject({ message: '文件校验失败，请重新加载' })
  })
})
