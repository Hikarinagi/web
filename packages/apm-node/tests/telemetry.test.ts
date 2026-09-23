import { createRequire } from 'node:module'
import type { Server } from 'node:http'
import { context, propagation } from '@opentelemetry/api'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { tick } from '../src/schedule'
import {
  ATTR_REQUEST_ID,
  currentTraceparent,
  failSpan,
  identify,
  log,
  nameRoute,
  setSpanAttributes,
  spanOfRequest,
  startNodeTelemetry,
  startNodeTelemetryFromEnv,
  track,
} from '../src/index'

type Received = { path: string; auth: string | undefined; body: any }

function listen(server: Server): Promise<number> {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port))
  })
}

describe('node telemetry', () => {
  const received: Received[] = []
  let ingest: Server
  let upstream: Server | undefined
  let ingestPort = 0

  beforeAll(async () => {
    const { createServer } = createRequire(import.meta.url)(
      'node:http',
    ) as typeof import('node:http')
    ingest = createServer((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', () => {
        received.push({
          path: req.url ?? '',
          auth: req.headers.authorization,
          body: JSON.parse(Buffer.concat(chunks).toString()),
        })
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{}')
      })
    })
    ingestPort = await listen(ingest)
  })

  afterAll(() => {
    ingest.close()
    upstream?.close()
  })

  it('stays disabled without endpoint and key', () => {
    const t = startNodeTelemetryFromEnv('svc', '1', {}, {})
    expect(t.enabled).toBe(false)
    expect(() => track('noop')).not.toThrow()
  })

  it('exports server spans, client spans, events and errors to the ingest', async () => {
    const t = startNodeTelemetry({
      service: 'hikari-web',
      version: '9.9.9',
      environment: 'staging',
      endpoint: `http://127.0.0.1:${ingestPort}/`,
      key: 'hkapm_node',
      sampleRate: 1,
      requestIdHeader: 'hikari-request-id',
    })
    expect(t.enabled).toBe(true)

    const http = createRequire(import.meta.url)('node:http') as typeof import('node:http')
    upstream = http.createServer((req, res) => {
      setSpanAttributes({ 'upstream.custom': 'yes' })
      spanOfRequest(req)?.setAttribute(ATTR_REQUEST_ID, 'req-42')
      if (req.url?.startsWith('/api/v3/user/me')) {
        identify(42, req)
        nameRoute('get', '/api/v3/user/:who', { origin: true })
      }
      res.writeHead(200, { 'content-type': 'application/json', 'hikari-request-id': 'req-42' })
      res.end(
        JSON.stringify({
          traceparent: req.headers.traceparent ?? null,
          inner: currentTraceparent() ?? null,
        }),
      )
    })
    const upstreamPort = await listen(upstream)

    const response = await fetch(`http://127.0.0.1:${upstreamPort}/api/v3/user/me?x=1`)
    const echoed = (await response.json()) as { traceparent: string | null; inner: string | null }
    expect(echoed.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
    expect(echoed.inner).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
    expect(echoed.inner!.slice(3, 35)).toBe(echoed.traceparent!.slice(3, 35))

    const fromPage = propagation.setBaggage(
      context.active(),
      propagation.createBaggage({
        'hikari.origin': { value: 'browser' },
        'hikari.origin_name': { value: '/galgames/1' },
      }),
    )
    await context.with(fromPage, async () => {
      await (await fetch(`http://127.0.0.1:${upstreamPort}/api/v3/galgames`)).text()
    })
    await tick('Sweeper.run', async () => {
      await (await fetch(`http://127.0.0.1:${upstreamPort}/api/v3/sweep`)).text()
      track('sweep.done')
      log('warn', 'token refresh failed', { 'nest.context': 'BangumiAuth' })
      failSpan(new Error('HTTP 400 invalid_grant'), { 'bangumi.stage': 'refresh' })
    })()

    track('user.registered', { 'user.id': '42' })
    t.captureError(new RangeError('bad range'), { where: 'test' })
    await t.flush()
    await t.shutdown()

    const traces = received.filter(r => r.path === '/v1/traces')
    const logs = received.filter(r => r.path === '/v1/logs')
    expect(traces.length).toBeGreaterThan(0)
    expect(logs.length).toBeGreaterThan(0)
    expect(traces[0]!.auth).toBe('Bearer hkapm_node')

    const spans = traces.flatMap(r =>
      r.body.resourceSpans.flatMap((rs: any) => rs.scopeSpans.flatMap((ss: any) => ss.spans)),
    )
    const kinds = new Set(spans.map((s: any) => s.kind))
    expect(kinds.has(2)).toBe(true)
    expect(kinds.has(3)).toBe(true)
    const attr = (span: any, key: string) =>
      span?.attributes.find((a: any) => a.key === key)?.value?.stringValue
    const serverOf = (path: string) =>
      spans.find((s: any) => s.kind === 2 && attr(s, 'url.path') === path)
    const server = serverOf('/api/v3/user/me')
    expect(server.attributes.find((a: any) => a.key === 'hikari.request_id')?.value).toEqual({
      stringValue: 'req-42',
    })
    expect(attr(server, 'hikari.entry')).toBe('http')
    expect(attr(server, 'hikari.entry_name')).toBe('GET /api/v3/user/:who')
    expect(attr(server, 'http.route')).toBe('/api/v3/user/:who')
    expect(attr(server, 'hikari.origin_name')).toBe('GET /api/v3/user/:who')
    expect(attr(server, 'hikari.origin')).toBe('unknown')
    expect(attr(server, 'hikari.caller')).toBe('hikari-web')
    expect(attr(server, 'user.id')).toBe('42')
    expect(attr(serverOf('/api/v3/galgames'), 'user.id')).toBeUndefined()
    const rootClient = spans.find(
      (s: any) => s.kind === 3 && attr(s, 'url.path') === '/api/v3/user/me',
    )
    expect(attr(rootClient, 'hikari.entry')).toBe('unknown')
    expect(attr(rootClient, 'hikari.origin')).toBe('unknown')
    expect(attr(rootClient, 'hikari.entry_name')).toBeTruthy()

    const fromBrowser = serverOf('/api/v3/galgames')
    expect(attr(fromBrowser, 'hikari.origin')).toBe('browser')
    expect(attr(fromBrowser, 'hikari.origin_name')).toBe('/galgames/1')
    expect(attr(fromBrowser, 'hikari.caller')).toBe('hikari-web')

    const scheduled = serverOf('/api/v3/sweep')
    expect(attr(scheduled, 'hikari.entry')).toBe('http')
    expect(attr(scheduled, 'hikari.origin')).toBe('schedule')
    expect(attr(scheduled, 'hikari.origin_name')).toBe('Sweeper.run')
    expect(attr(scheduled, 'hikari.caller_name')).toBe('Sweeper.run')
    const sweepClient = spans.find(
      (s: any) => s.kind === 3 && attr(s, 'url.path') === '/api/v3/sweep',
    )
    expect(attr(sweepClient, 'hikari.entry')).toBe('schedule')
    expect(attr(sweepClient, 'hikari.entry_name')).toBe('Sweeper.run')
    const tickSpan = spans.find((s: any) => s.name === 'schedule Sweeper.run')
    expect(tickSpan.parentSpanId ?? '').toBe('')
    expect(tickSpan.status).toEqual({ code: 2, message: 'HTTP 400 invalid_grant' })
    expect(attr(tickSpan, 'bangumi.stage')).toBe('refresh')
    expect(tickSpan.events.find((e: any) => e.name === 'exception')).toBeDefined()
    expect(sweepClient.traceId).toBe(tickSpan.traceId)
    const resource = traces[0]!.body.resourceSpans[0].resource.attributes
    expect(resource.find((a: any) => a.key === 'service.name').value).toEqual({
      stringValue: 'hikari-web',
    })
    expect(resource.find((a: any) => a.key === 'deployment.environment').value).toEqual({
      stringValue: 'staging',
    })

    const records = logs.flatMap(r =>
      r.body.resourceLogs.flatMap((rl: any) => rl.scopeLogs.flatMap((sl: any) => sl.logRecords)),
    )
    const event = records.find((r: any) => r.eventName === 'user.registered')
    expect(event).toBeDefined()
    expect(event.attributes.find((a: any) => a.key === 'user.id').value).toEqual({
      stringValue: '42',
    })
    const sweepEvent = records.find((r: any) => r.eventName === 'sweep.done')
    expect(attr(sweepEvent, 'hikari.entry')).toBe('schedule')
    expect(attr(sweepEvent, 'hikari.entry_name')).toBe('Sweeper.run')
    const warned = records.find((r: any) => r.severityNumber === 13)
    expect(warned.body).toEqual({ stringValue: 'token refresh failed' })
    expect(attr(warned, 'nest.context')).toBe('BangumiAuth')
    expect(attr(warned, 'hikari.entry_name')).toBe('Sweeper.run')
    const error = records.find((r: any) => r.severityNumber === 17)
    expect(error.body).toEqual({ stringValue: 'bad range' })
    expect(error.attributes.find((a: any) => a.key === 'exception.type').value).toEqual({
      stringValue: 'RangeError',
    })
  }, 20_000)
})

describe('esm hook', () => {
  it('resolves the instrumentation loader hook', async () => {
    const { esmHookPath } = await import('../src/index')
    expect(esmHookPath()).toMatch(/hook\.mjs$/)
  })
})
