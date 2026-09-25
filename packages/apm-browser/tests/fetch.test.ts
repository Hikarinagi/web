import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createApm, instrumentFetch, type Apm } from '../src/index.js'

type Sent = { url: string; body: any }

function build() {
  const sent: Sent[] = []
  const exporterFetch = vi.fn(async (url: string, init: RequestInit) => {
    sent.push({ url, body: JSON.parse(String(init.body)) })
    return new Response(null, { status: 200 })
  })
  const apm = createApm({
    endpoint: 'https://apm.test',
    key: 'k',
    service: 'hikari-web',
    version: '1',
    environment: 'test',
    sampleRate: 1,
    fetch: exporterFetch as unknown as typeof fetch,
    storage: null,
  })
  return { apm, sent }
}

const spansOf = (sent: Sent[]) =>
  sent.flatMap(s => s.body.resourceSpans?.[0]?.scopeSpans?.[0]?.spans ?? [])
const attr = (span: any, key: string) => span.attributes.find((kv: any) => kv.key === key)?.value

describe('instrumentFetch', () => {
  const origin = 'https://www.hikarinagi.org'
  let calls: { input: RequestInfo | URL; init?: RequestInit }[]
  let responder: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  let uninstall = () => {}
  let apm: Apm
  let sent: Sent[]

  beforeEach(() => {
    calls = []
    responder = async () =>
      new Response('{"success":true}', {
        status: 200,
        headers: { 'content-type': 'application/json', 'hikari-request-id': 'req-1' },
      })
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input, init })
      return responder(input, init)
    }) as typeof fetch
    ;({ apm, sent } = build())
    uninstall = instrumentFetch(apm, { origin, ignore: url => url.startsWith('https://apm.test') })
  })

  afterEach(() => {
    uninstall()
  })

  it('injects traceparent for same-origin requests and records the span', async () => {
    await fetch('/api/v3/user/me', { headers: { accept: 'application/json' } })
    await apm.flush()
    const headers = calls[0]!.init!.headers as Headers
    expect(headers.get('traceparent')).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
    expect(headers.get('accept')).toBe('application/json')
    expect(headers.get('baggage')).toBe(
      'hikari.origin=browser,hikari.origin_name=%2F,hikari.caller=hikari-web,hikari.caller_name=%2F',
    )
    const spans = spansOf(sent)
    expect(spans).toHaveLength(1)
    expect(spans[0].name).toBe('GET /api/v3/user/me')
    expect(attr(spans[0], 'hikari.entry')).toEqual({ stringValue: 'browser' })
    expect(attr(spans[0], 'hikari.origin')).toEqual({ stringValue: 'browser' })
    expect(attr(spans[0], 'hikari.entry_name')).toEqual({ stringValue: '/' })
    expect(spans[0].status).toEqual({ code: 1 })
    expect(attr(spans[0], 'http.response.status_code')).toEqual({ intValue: '200' })
    expect(attr(spans[0], 'hikari.request_id')).toEqual({ stringValue: 'req-1' })
  })

  it('keeps Request objects and their headers', async () => {
    await fetch(
      new Request(`${origin}/api/v3/shelf`, { method: 'POST', headers: { 'x-custom': '1' } }),
    )
    const headers = calls[0]!.init!.headers as Headers
    expect(headers.get('x-custom')).toBe('1')
    expect(headers.get('traceparent')).toBeTruthy()
    await apm.flush()
    expect(spansOf(sent)[0].name).toBe('POST /api/v3/shelf')
  })

  it('does not leak trace headers cross-origin and skips ignored urls', async () => {
    await fetch('https://cdn.example/a.png')
    expect(calls[0]!.init).toBeUndefined()
    await fetch(new Request('https://cdn.example/b.png', { headers: { accept: 'image/*' } }))
    expect(calls[1]!.init).toBeUndefined()
    expect((calls[1]!.input as Request).headers.get('baggage')).toBeNull()
    await fetch('https://apm.test/v1/traces', { method: 'POST' })
    await apm.flush()
    expect(spansOf(sent).map((s: any) => s.name)).toEqual([
      'GET cdn.example/a.png',
      'GET cdn.example/b.png',
    ])
  })

  it('names cross-origin requests with their host and records the target', async () => {
    await fetch('https://op.example.com:8443/api/track', { method: 'POST' })
    await fetch('/api/v3/user/me')
    await apm.flush()
    const [external, own] = spansOf(sent)
    expect(external.name).toBe('POST op.example.com:8443/api/track')
    expect(attr(external, 'server.address')).toEqual({ stringValue: 'op.example.com' })
    expect(attr(external, 'server.port')).toEqual({ intValue: '8443' })
    expect(attr(external, 'url.scheme')).toEqual({ stringValue: 'https' })
    expect(attr(external, 'url.path')).toEqual({ stringValue: '/api/track' })
    expect(own.name).toBe('GET /api/v3/user/me')
    expect(attr(own, 'server.address')).toEqual({ stringValue: 'www.hikarinagi.org' })
    expect(attr(own, 'server.port')).toBeUndefined()
  })

  it('keeps first-party 4xx out of the error status but records the biz code', async () => {
    responder = async () =>
      new Response('{"success":false,"error":{"code":"COMMON_NOT_FOUND"},"request_id":"req-9"}', {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })
    const response = await fetch('/api/v3/nope')
    expect(await response.json()).toMatchObject({ success: false })
    await apm.flush()
    const span = spansOf(sent)[0]
    expect(span.status).toEqual({ code: 0 })
    expect(attr(span, 'hikari.outcome')).toEqual({ stringValue: 'client_error' })
    expect(attr(span, 'http.response.status_code')).toEqual({ intValue: '404' })
    expect(attr(span, 'hikari.biz_code')).toEqual({ stringValue: 'COMMON_NOT_FOUND' })
    expect(attr(span, 'hikari.request_id')).toEqual({ stringValue: 'req-9' })
  })

  it('marks first-party 5xx as a fault', async () => {
    responder = async () =>
      new Response('{"success":false,"error":{"code":"COMMON_INTERNAL"}}', {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    await fetch('/api/v3/shelf')
    await apm.flush()
    const span = spansOf(sent)[0]
    expect(span.status).toEqual({ code: 2, message: 'COMMON_INTERNAL' })
    expect(attr(span, 'hikari.outcome')).toEqual({ stringValue: 'fault' })
  })

  it('records first-party network failures as errors and rethrows', async () => {
    responder = async () => {
      throw new TypeError('Failed to fetch')
    }
    await expect(fetch('/api/v3/shelf')).rejects.toThrow('Failed to fetch')
    await apm.flush()
    const span = spansOf(sent)[0]
    expect(span.status).toEqual({ code: 2, message: 'Failed to fetch' })
    expect(attr(span, 'hikari.outcome')).toEqual({ stringValue: 'network' })
    expect(attr(span, 'error.type')).toEqual({ stringValue: 'TypeError' })
  })

  it('treats an aborted request as no error', async () => {
    responder = async () => {
      throw new DOMException('The user aborted a request.', 'AbortError')
    }
    await expect(fetch('/api/v3/promotions/nav-items')).rejects.toThrow('aborted')
    await apm.flush()
    const span = spansOf(sent)[0]
    expect(span.status).toEqual({ code: 0 })
    expect(attr(span, 'hikari.outcome')).toEqual({ stringValue: 'aborted' })
    expect(attr(span, 'error.type')).toEqual({ stringValue: 'AbortError' })
  })

  it('never turns a third-party failure into an error', async () => {
    responder = async input =>
      String(input).includes('blocked')
        ? Promise.reject(new TypeError('Failed to fetch'))
        : new Response('nope', { status: 401 })
    await fetch('https://analysis.example/api/track', { method: 'POST' })
    await expect(fetch('https://blocked.example/api/track', { method: 'POST' })).rejects.toThrow()
    await apm.flush()
    const [rejected, blocked] = spansOf(sent)
    expect(rejected.status).toEqual({ code: 0 })
    expect(attr(rejected, 'hikari.outcome')).toEqual({ stringValue: 'external' })
    expect(attr(rejected, 'http.response.status_code')).toEqual({ intValue: '401' })
    expect(blocked.status).toEqual({ code: 0 })
    expect(attr(blocked, 'hikari.outcome')).toEqual({ stringValue: 'external' })
    expect(attr(blocked, 'error.type')).toEqual({ stringValue: 'TypeError' })
  })

  it('counts configured first-party origins as our own', async () => {
    uninstall()
    uninstall = instrumentFetch(apm, { origin, firstPartyOrigins: ['https://api.hikarinagi.org'] })
    responder = async () => new Response('{"success":false}', { status: 503 })
    await fetch('https://api.hikarinagi.org/v3/health')
    await apm.flush()
    const span = spansOf(sent)[0]
    expect(span.status).toEqual({ code: 2, message: 'HTTP 503' })
    expect(attr(span, 'hikari.outcome')).toEqual({ stringValue: 'fault' })
  })

  it('installs once and restores the original on uninstall', () => {
    const patched = globalThis.fetch
    const again = instrumentFetch(apm, { origin })
    expect(globalThis.fetch).toBe(patched)
    again()
    uninstall()
    expect((globalThis.fetch as any)[Symbol.for('hikarinagi.apm.fetch')]).toBeUndefined()
  })
})
