import { createServer, request, type Server } from 'node:http'
import { once } from 'node:events'
import { createApp, createRouter, toNodeListener } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../server/utils/public-cache', () => ({ cachedPublicBackendBody: vi.fn() }))

describe('download Nitro proxy', () => {
  const raw = vi.fn()
  let server: Server
  let url: string

  function send(path: string, options: { method?: string; headers?: Record<string, string> } = {}) {
    return new Promise<{
      status: number
      headers: Headers
      arrayBuffer: () => Promise<ArrayBuffer>
      json: () => Promise<unknown>
    }>((resolve, reject) => {
      const req = request(url + path, options, res => {
        const chunks: Buffer[] = []
        res.on('data', chunk => chunks.push(Buffer.from(chunk)))
        res.on('error', reject)
        res.on('end', () => {
          const headers = new Headers()
          for (const [name, value] of Object.entries(res.headers)) {
            for (const item of Array.isArray(value) ? value : value ? [value] : [])
              headers.append(name, item)
          }
          const buffer = Buffer.concat(chunks)
          resolve({
            status: res.statusCode!,
            headers,
            arrayBuffer: async () => Uint8Array.from(buffer).buffer,
            json: async () => JSON.parse(buffer.toString()),
          })
        })
      })
      req.on('error', reject)
      req.end()
    })
  }

  beforeEach(async () => {
    raw.mockReset()
    vi.stubGlobal('$fetch', { raw })
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test/api/v3',
      oidc: { issuer: 'http://identity.test', clientId: 'web' },
    }))
    const { default: handler } = await import('../../server/api/v3/[...path]')
    const router = createRouter().use('/api/v3/**:path', handler)
    server = createServer(toNodeListener(createApp().use(router)))
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    url = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  })

  afterEach(async () => {
    server?.closeAllConnections()
    if (server) await new Promise<void>(resolve => server.close(() => resolve()))
    vi.unstubAllGlobals()
  })

  it('forwards exact binary bytes and file response headers', async () => {
    const bytes = Uint8Array.from([0, 255, 80, 75, 200])
    raw.mockResolvedValue({
      status: 200,
      _data: new Response(bytes).body,
      headers: new Headers({
        'content-type': 'application/epub+zip',
        'cache-control': 'private, no-store',
        'content-disposition': 'attachment; filename="novel.epub"',
        'content-length': String(bytes.length),
      }),
    })
    const response = await send('/api/v3/user/me/novel/download/volumes/1', {
      method: 'POST',
      headers: { cookie: 'hikari_access_token=current' },
    })
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
    expect(response.headers.get('content-disposition')).toContain('novel.epub')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('content-length')).toBe(String(bytes.length))
    expect(raw.mock.calls[0][1].headers.get('accept-encoding')).toBe('identity')
    expect(raw).toHaveBeenCalledWith(
      'http://api.test/api/v3/user/me/novel/download/volumes/1',
      expect.objectContaining({
        responseType: 'stream',
        retry: false,
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it.each([
    '/api/v3/reader/mangas/1/chapters/2/pages/3/content',
    '/api/v3/user/me/manga/download/mangas/1/files',
  ])('preserves encrypted manga bytes and abort propagation: %s', async path => {
    const bytes = Uint8Array.from([0, 255, 200, 128, 1])
    raw.mockResolvedValue({
      status: 200,
      _data: new Response(bytes).body,
      headers: new Headers({
        'content-type': 'application/octet-stream',
        'cache-control': 'private, no-store',
      }),
    })
    const response = await send(path, { method: 'POST' })
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
    expect(response.headers.get('content-type')).toBe('application/octet-stream')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(raw.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      responseType: 'stream',
      retry: false,
      signal: expect.any(AbortSignal),
    })
  })

  it('refreshes login once and keeps the replacement session cookies on a binary response', async () => {
    const canceled = vi.fn()
    raw
      .mockResolvedValueOnce({
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        _data: new ReadableStream({ cancel: canceled }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Headers(),
        _data: { access_token: 'fresh', refresh_token: 'fresh-refresh' },
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        _data: new Response(Uint8Array.from([5, 6])).body,
      })
    const response = await send('/api/v3/reader/sessions/session/content', {
      headers: { cookie: 'hikari_access_token=expired; hikari_refresh_token=binary-refresh-test' },
    })
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([5, 6])
    expect(canceled).toHaveBeenCalledOnce()
    expect(raw).toHaveBeenCalledTimes(3)
    expect(raw.mock.calls[2][1].headers.get('cookie')).toContain('hikari_access_token=fresh')
    expect(response.headers.get('set-cookie')).toContain('hikari_access_token=fresh')
  })

  it('retains JSON business errors and their HTTP status', async () => {
    const body = {
      success: false,
      error: { code: 'READER_TRANSFER_LIMITED', message: '稍后再试' },
      request_id: 'test',
    }
    raw.mockResolvedValue({
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      _data: new Response(JSON.stringify(body)).body,
    })
    const response = await send('/api/v3/reader/sessions/session/content')
    expect(response.status).toBe(429)
    expect(await response.json()).toEqual(body)
  })

  it('drops compressed upstream lengths after fetch has decompressed the body', async () => {
    raw.mockResolvedValue({
      status: 200,
      headers: new Headers({
        'content-type': 'application/octet-stream',
        'content-encoding': 'gzip',
        'content-length': '100',
      }),
      _data: new Response(Uint8Array.from([1, 2, 3])).body,
    })
    const response = await send('/api/v3/reader/sessions/session/content')
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3])
    expect(response.headers.get('content-length')).not.toBe('100')
    expect(response.headers.has('content-encoding')).toBe(false)
  })

  it('does not forward the upstream length when JSON is serialized again', async () => {
    raw.mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json', 'content-length': '100' }),
      _data: { success: true },
    })
    const response = await send('/api/v3/user/me')
    expect(await response.json()).toEqual({ success: true })
    expect(response.headers.get('content-length')).not.toBe('100')
  })

  it.each([
    '/api/v3/user/me/novel/download/series/1/plan',
    '/api/v3/user/me/manga/download/mangas/1/plan',
  ])('keeps plans as JSON while passing a cancellation signal: %s', async path => {
    const body = { success: true, data: { required_cards: 1, parts: [] } }
    raw.mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      _data: body,
    })
    const response = await send(path, { method: 'POST' })
    expect(await response.json()).toEqual(body)
    expect(raw.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
    expect(raw.mock.calls[0][1].responseType).toBeUndefined()
  })

  it.each([
    '/api/v3/user/me/novel/download/series/1/plan',
    '/api/v3/user/me/manga/download/mangas/1/plan',
    '/api/v3/user/me/manga/download/mangas/1/files',
  ])('aborts the upstream request when the client disconnects: %s', async path => {
    const started = Promise.withResolvers<AbortSignal>()
    const canceled = Promise.withResolvers<undefined>()
    raw.mockImplementation((_target, options) => {
      started.resolve(options.signal)
      return new Promise((_resolve, reject) => {
        options.signal?.addEventListener(
          'abort',
          () => {
            canceled.resolve(undefined)
            reject(options.signal.reason)
          },
          { once: true },
        )
      })
    })
    const client = request(url + path, { method: 'POST' })
    client.on('error', () => undefined)
    client.end()
    const signal = await started.promise
    expect(signal).toBeInstanceOf(AbortSignal)
    expect(signal.aborted).toBe(false)
    client.destroy()
    await canceled.promise
    expect(signal.aborted).toBe(true)
    expect(raw).toHaveBeenCalledOnce()
  })
})
