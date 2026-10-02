import { createRequire } from 'node:module'
import type { Server } from 'node:http'
import { afterAll, describe, expect, it } from 'vitest'

import { ATTR_OUTCOME, currentSpan, markAborted, startNodeTelemetry } from '../src/index'

type Received = { path: string; body: any }

function listen(server: Server): Promise<number> {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port))
  })
}

const attr = (span: any, key: string) => span.attributes.find((kv: any) => kv.key === key)?.value

describe('aborted requests', () => {
  const received: Received[] = []
  const servers: Server[] = []

  afterAll(() => {
    for (const server of servers) {
      server.closeAllConnections()
      server.close()
    }
  })

  it('records the server span and the client spans it cancels as aborted', async () => {
    const http = createRequire(import.meta.url)('node:http') as typeof import('node:http')
    const ingest = http.createServer((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', () => {
        received.push({ path: req.url ?? '', body: JSON.parse(Buffer.concat(chunks).toString()) })
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{}')
      })
    })
    servers.push(ingest)
    const ingestPort = await listen(ingest)
    const t = startNodeTelemetry({
      service: 'hikari-api',
      version: '1',
      environment: 'test',
      endpoint: `http://127.0.0.1:${ingestPort}/`,
      key: 'hkapm_node',
      sampleRate: 1,
    })

    const traced = createRequire(import.meta.url)('node:http') as typeof import('node:http')
    const hanging = traced.createServer(() => undefined)
    servers.push(hanging)
    const hangingPort = await listen(hanging)
    const upstream = traced.createServer((req, res) => {
      const owner = currentSpan()
      const controller = new AbortController()
      const pending = traced.get(`http://127.0.0.1:${hangingPort}/object`, {
        signal: controller.signal,
      })
      pending.on('error', () => {
        res.writeHead(499)
        res.end()
      })
      setTimeout(() => {
        markAborted(owner)
        controller.abort()
      }, 30)
    })
    servers.push(upstream)
    const port = await listen(upstream)

    await (await fetch(`http://127.0.0.1:${port}/files/1`)).text()
    await t.flush()

    const spans = received
      .filter(r => r.path === '/v1/traces')
      .flatMap(r =>
        r.body.resourceSpans.flatMap((rs: any) => rs.scopeSpans.flatMap((ss: any) => ss.spans)),
      )
    const server = spans.find((s: any) => s.kind === 2)
    const cancelled = spans.find(
      (s: any) => s.kind === 3 && JSON.stringify(s.attributes).includes('/object'),
    )
    expect(server).toBeDefined()
    expect(cancelled).toBeDefined()
    expect(attr(server, ATTR_OUTCOME)).toEqual({ stringValue: 'aborted' })
    expect(cancelled.status.code).toBe(2)
    expect(attr(cancelled, ATTR_OUTCOME)).toEqual({ stringValue: 'aborted' })
  })
})
