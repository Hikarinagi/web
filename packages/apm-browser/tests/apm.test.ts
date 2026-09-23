import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApm, nanos, newSpanId, newTraceId, redactQuery, traceparent } from '../src/index.js'
import { SESSION_IDLE_MS, SESSION_STORAGE_KEY } from '../src/session.js'

type Sent = { url: string; body: any; init: RequestInit }

function fakeFetch(status = 200) {
  const sent: Sent[] = []
  const impl = vi.fn(async (url: string, init: RequestInit) => {
    sent.push({ url, body: JSON.parse(String(init.body)), init })
    return new Response(null, { status })
  })
  return { sent, impl }
}

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    map,
  }
}

function build(overrides: Partial<Parameters<typeof createApm>[0]> = {}, status = 200) {
  const { sent, impl } = fakeFetch(status)
  let clock = 1_758_000_000_000
  const apm = createApm({
    endpoint: 'https://apm.test/',
    key: 'hkapm_test',
    service: 'hikari-web',
    version: '1.2.3',
    environment: 'staging',
    fetch: impl as unknown as typeof fetch,
    now: () => clock,
    random: () => 0.5,
    storage: memoryStorage(),
    flushIntervalMs: 1000,
    ...overrides,
  })
  return { apm, sent, impl, tick: (ms: number) => (clock += ms), clock: () => clock }
}

const spansOf = (sent: Sent[]) =>
  sent
    .filter(s => s.url.endsWith('/v1/traces'))
    .flatMap(s => s.body.resourceSpans[0].scopeSpans[0].spans)
const logsOf = (sent: Sent[]) =>
  sent
    .filter(s => s.url.endsWith('/v1/logs'))
    .flatMap(s => s.body.resourceLogs[0].scopeLogs[0].logRecords)
const attr = (record: any, key: string) =>
  record.attributes.find((kv: any) => kv.key === key)?.value

beforeEach(() => {
  vi.useRealTimers()
})

describe('ids', () => {
  it('generates w3c compatible ids and traceparent', () => {
    const t = newTraceId()
    const s = newSpanId()
    expect(t).toMatch(/^[0-9a-f]{32}$/)
    expect(s).toMatch(/^[0-9a-f]{16}$/)
    expect(traceparent(t, s, true)).toBe(`00-${t}-${s}-01`)
    expect(traceparent(t, s, false)).toBe(`00-${t}-${s}-00`)
    expect(newTraceId()).not.toBe(t)
  })

  it('converts milliseconds to exact nanosecond strings', () => {
    expect(nanos(1_758_000_000_123.5)).toBe('1758000000123500000')
    expect(nanos(0)).toBe('0')
  })
})

describe('spans', () => {
  it('exports sampled spans as otlp with identity attributes', async () => {
    const { apm, sent } = build({ random: () => 0.01 })
    apm.identify('42')
    const span = apm.startSpan('GET /api/v3/shelf', {
      kind: 'client',
      attributes: { 'http.request.method': 'GET' },
    })
    expect(span.traceparent()).toBe(`00-${span.traceId}-${span.spanId}-01`)
    span.setAttribute('http.response.status_code', 200)
    span.end({ status: 'ok' })
    await apm.flush()

    const spans = spansOf(sent)
    expect(spans).toHaveLength(1)
    expect(spans[0].kind).toBe(3)
    expect(spans[0].flags).toBe(257)
    expect(spans[0].status).toEqual({ code: 1 })
    expect(attr(spans[0], 'http.response.status_code')).toEqual({ intValue: '200' })
    expect(attr(spans[0], 'user.id')).toEqual({ stringValue: '42' })
    expect(attr(spans[0], 'session.id')).toEqual({ stringValue: apm.sessionId })
    const resource = sent[0].body.resourceSpans[0].resource.attributes
    expect(resource.find((kv: any) => kv.key === 'service.name').value).toEqual({
      stringValue: 'hikari-web',
    })
    expect(sent[0].init.headers).toMatchObject({ Authorization: 'Bearer hkapm_test' })
    expect(sent[0].init.keepalive).toBe(true)
  })

  it('drops unsampled spans unless they errored', async () => {
    const { apm, sent } = build({ random: () => 0.99 })
    const ok = apm.startSpan('GET /a')
    expect(ok.traceparent().endsWith('-00')).toBe(true)
    ok.end({ status: 'ok' })
    const failed = apm.startSpan('POST /b')
    failed.end({ status: 'error', message: 'HTTP 500' })
    await apm.flush()
    const spans = spansOf(sent)
    expect(spans).toHaveLength(1)
    expect(spans[0].name).toBe('POST /b')
    expect(spans[0].flags).toBe(256)
    expect(spans[0].status).toEqual({ code: 2, message: 'HTTP 500' })
  })

  it('keeps children on the parent trace and sampling decision', async () => {
    const { apm, sent } = build({ random: () => 0.99 })
    const parent = apm.startSpan('page')
    const child = apm.startSpan('GET /x', { parent })
    expect(child.traceId).toBe(parent.traceId)
    expect(child.sampled).toBe(false)
    child.end({ status: 'error' })
    await apm.flush()
    expect(spansOf(sent)[0].parentSpanId).toBe(parent.spanId)
  })

  it('ends a span only once', async () => {
    const { apm, sent } = build({ random: () => 0 })
    const span = apm.startSpan('x')
    span.end({ status: 'ok' })
    span.end({ status: 'error' })
    await apm.flush()
    expect(spansOf(sent)).toHaveLength(1)
  })
})

describe('events and errors', () => {
  it('tracks events as otlp log records with event names', async () => {
    const { apm, sent } = build()
    apm.identify('7')
    apm.pageView({
      path: '/galgames/1?tab=info&token=secret',
      route: '/galgames/:id',
      title: 'Galgame',
      referrer: 'https://www.hikarinagi.org/?q=1',
    })
    apm.track('favorite_add', { galgame_id: 1, sticky: true })
    await apm.flush()

    const logs = logsOf(sent)
    expect(logs).toHaveLength(2)
    expect(logs[0].eventName).toBe('page_view')
    expect(attr(logs[0], 'url.path')).toEqual({ stringValue: '/galgames/1' })
    expect(attr(logs[0], 'url.query')).toEqual({ stringValue: 'tab=info&token=<redacted>' })
    expect(attr(logs[0], 'page.referrer')).toEqual({ stringValue: '/' })
    expect(attr(logs[0], 'page.title')).toEqual({ stringValue: 'Galgame' })
    expect(logs[1].eventName).toBe('favorite_add')
    expect(attr(logs[1], 'galgame_id')).toEqual({ intValue: '1' })
    expect(attr(logs[1], 'sticky')).toEqual({ boolValue: true })
    expect(attr(logs[1], 'user.id')).toEqual({ stringValue: '7' })
    expect(attr(logs[1], 'url.path')).toEqual({ stringValue: '/galgames/1' })
    expect(attr(logs[1], 'hikari.entry_name')).toEqual({ stringValue: '/galgames/:id' })
    expect(attr(logs[1], 'hikari.origin_name')).toEqual({ stringValue: '/galgames/:id' })
    expect(apm.baggage()).toBe(
      'hikari.origin=browser,hikari.origin_name=%2Fgalgames%2F%3Aid,hikari.caller=hikari-web,hikari.caller_name=%2Fgalgames%2F%3Aid',
    )
  })

  it('captures errors with stack traces and a per-minute budget', async () => {
    const { apm, sent, tick } = build({ errorsPerMinute: 2 })
    apm.captureError(new TypeError('boom'), { component: 'Feed' })
    apm.captureError('plain')
    apm.captureError(new Error('dropped'))
    await apm.flush()
    let logs = logsOf(sent)
    expect(logs).toHaveLength(2)
    expect(logs[0].severityNumber).toBe(17)
    expect(logs[0].body).toEqual({ stringValue: 'boom' })
    expect(attr(logs[0], 'exception.type')).toEqual({ stringValue: 'TypeError' })
    expect(attr(logs[0], 'exception.stacktrace').stringValue).toContain('boom')
    expect(attr(logs[0], 'component')).toEqual({ stringValue: 'Feed' })
    expect(logs[1].body).toEqual({ stringValue: 'plain' })

    tick(61_000)
    apm.captureError(new Error('next minute'))
    await apm.flush()
    logs = logsOf(sent)
    expect(logs).toHaveLength(3)
  })

  it('installs global handlers that report window errors', async () => {
    const { apm, sent } = build()
    const uninstall = apm.installGlobalHandlers()
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'script blew up',
        filename: 'app.js',
        lineno: 3,
        colno: 9,
      }),
    )
    await apm.flush()
    const logs = logsOf(sent)
    expect(logs).toHaveLength(1)
    expect(attr(logs[0], 'code.filepath')).toEqual({ stringValue: 'app.js' })
    uninstall()
    window.dispatchEvent(new ErrorEvent('error', { message: 'after uninstall' }))
    await apm.flush()
    expect(logsOf(sent)).toHaveLength(1)
  })
})

describe('exporter', () => {
  it('batches, retries retryable failures, and drops after three attempts', async () => {
    const { apm, impl, sent } = build({}, 503)
    apm.track('a')
    await apm.flush()
    await apm.flush()
    await apm.flush()
    await apm.flush()
    expect(impl).toHaveBeenCalledTimes(3)
    expect(sent.every(s => logsOf([s]).length === 1)).toBe(true)
  })

  it('drops batches on non-retryable failures', async () => {
    const { apm, impl } = build({}, 400)
    apm.track('a')
    await apm.flush()
    await apm.flush()
    expect(impl).toHaveBeenCalledTimes(1)
  })

  it('bounds the queue by dropping the oldest items', async () => {
    const { apm, sent } = build({ maxQueue: 3, maxBatch: 10 })
    for (let i = 0; i < 5; i++) apm.track(`e${i}`)
    await apm.flush()
    expect(logsOf(sent).map(l => l.eventName)).toEqual(['e2', 'e3', 'e4'])
  })

  it('splits oversized batches', async () => {
    const { apm, sent } = build({ maxBatchBytes: 600, maxBatch: 10 })
    for (let i = 0; i < 4; i++) apm.track(`event_${i}`, { padding: 'x'.repeat(120) })
    await apm.flush()
    expect(sent.length).toBeGreaterThan(1)
    expect(logsOf(sent)).toHaveLength(4)
  })

  it('flushes on a timer', async () => {
    vi.useFakeTimers()
    const { apm, impl } = build({ flushIntervalMs: 1000 })
    apm.track('timed')
    expect(impl).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(impl).toHaveBeenCalledTimes(1)
  })

  it('survives a throwing fetch', async () => {
    const { apm } = build({
      fetch: (() => Promise.reject(new Error('offline'))) as unknown as typeof fetch,
    })
    apm.track('a')
    await expect(apm.flush()).resolves.toBeUndefined()
  })
})

describe('session', () => {
  it('persists the session and rotates it after 30 minutes idle', () => {
    const storage = memoryStorage()
    const { apm, tick } = build({ storage })
    const first = apm.sessionId
    expect(JSON.parse(storage.map.get(SESSION_STORAGE_KEY)!).id).toBe(first)
    tick(SESSION_IDLE_MS - 1)
    expect(apm.sessionId).toBe(first)
    tick(SESSION_IDLE_MS + 1)
    expect(apm.sessionId).not.toBe(first)
  })

  it('reuses a stored session across instances', () => {
    const storage = memoryStorage()
    const first = build({ storage }).apm.sessionId
    expect(build({ storage }).apm.sessionId).toBe(first)
  })

  it('works without storage', () => {
    const { apm } = build({ storage: null })
    expect(apm.sessionId).toMatch(/^[0-9a-f]{16}$/)
  })
})

describe('redaction', () => {
  it('keeps only allow-listed query keys', () => {
    expect(redactQuery('?page=2&q=secret&tab=x&flag', ['page', 'tab'])).toBe(
      'page=2&q=<redacted>&tab=x&flag',
    )
    expect(redactQuery('', ['page'])).toBe('')
  })
})
