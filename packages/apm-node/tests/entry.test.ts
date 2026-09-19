import {
  propagation,
  ROOT_CONTEXT,
  SamplingDecision,
  SpanKind,
  trace,
  TraceFlags,
  type Context,
  type Span,
} from '@opentelemetry/api'
import type { SdkLogRecord } from '@opentelemetry/sdk-logs'
import type { Span as SdkSpan } from '@opentelemetry/sdk-trace-base'
import { describe, expect, it } from 'vitest'

import {
  classifyRoot,
  codeLocation,
  EntryLogProcessor,
  EntryProcessor,
  EntryPropagator,
  entrySampler,
} from '../src/entry'
import { nameOf, tick } from '../src/schedule'

class FakeSpan {
  attributes: Record<string, unknown> = {}
  constructor(
    public kind: SpanKind,
    public name: string,
    attributes: Record<string, unknown> = {},
  ) {
    this.attributes = { ...attributes }
  }
  setAttribute(key: string, value: unknown) {
    this.attributes[key] = value
  }
  setAttributes(values: Record<string, unknown>) {
    Object.assign(this.attributes, values)
  }
  spanContext() {
    return {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      traceFlags: TraceFlags.SAMPLED,
    }
  }
}

const start = (span: FakeSpan, parent: Context = ROOT_CONTEXT) => {
  new EntryProcessor().onStart(span as unknown as SdkSpan, parent)
  return span.attributes
}

const withBaggage = (entries: Record<string, string>, base: Context = ROOT_CONTEXT) =>
  propagation.setBaggage(
    base,
    propagation.createBaggage(
      Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, { value }])),
    ),
  )

describe('entry processor', () => {
  it('classifies a server root as http from an external caller', () => {
    const attrs = start(
      new FakeSpan(SpanKind.SERVER, 'GET', {
        'http.request.method': 'GET',
        'url.path': '/api/v3/galgames',
        'user_agent.original': 'curl/8.5',
      }),
    )
    expect(attrs).toMatchObject({
      'hikari.entry': 'http',
      'hikari.entry_name': 'GET /api/v3/galgames',
      'hikari.origin': 'external',
      'hikari.origin_name': 'curl/8.5',
    })
    expect(attrs['hikari.caller']).toBeUndefined()
  })

  it('takes origin and caller from incoming baggage', () => {
    const attrs = start(
      new FakeSpan(SpanKind.SERVER, 'GET', { 'http.request.method': 'GET', 'url.path': '/x' }),
      withBaggage({
        'hikari.origin': 'browser',
        'hikari.origin_name': '/galgames/1',
        'hikari.caller': 'hikari-web-ssr',
        'hikari.caller_name': 'GET /api/pages/galgame',
      }),
    )
    expect(attrs).toMatchObject({
      'hikari.entry': 'http',
      'hikari.origin': 'browser',
      'hikari.origin_name': '/galgames/1',
      'hikari.caller': 'hikari-web-ssr',
      'hikari.caller_name': 'GET /api/pages/galgame',
    })
  })

  it('marks parentless internal work as unknown with its code location', () => {
    const attrs = start(new FakeSpan(SpanKind.INTERNAL, 'prisma:client:operation'))
    expect(attrs['hikari.entry']).toBe('unknown')
    expect(attrs['hikari.origin']).toBe('unknown')
    expect(String(attrs['code.file.path'])).toContain('entry.test')
    expect(attrs['hikari.entry_name']).toBe(
      attrs['code.function.name'] ?? attrs['hikari.entry_name'],
    )
  })

  it('lets children inherit the whole entry block and keeps explicit roots', () => {
    const parent = new FakeSpan(SpanKind.INTERNAL, 'schedule Sweeper.run', {
      'hikari.entry': 'schedule',
      'hikari.entry_name': 'Sweeper.run',
    })
    const rootAttrs = start(parent)
    expect(rootAttrs).toMatchObject({
      'hikari.origin': 'schedule',
      'hikari.origin_name': 'Sweeper.run',
    })
    const child = start(
      new FakeSpan(SpanKind.CLIENT, 'prisma:client:db_query'),
      trace.setSpan(ROOT_CONTEXT, parent as unknown as Span),
    )
    expect(child).toMatchObject({
      'hikari.entry': 'schedule',
      'hikari.entry_name': 'Sweeper.run',
      'hikari.origin': 'schedule',
      'hikari.origin_name': 'Sweeper.run',
    })
    expect(child['code.file.path']).toBeUndefined()
  })

  it('classifies consumers as queue', () => {
    expect(start(new FakeSpan(SpanKind.CONSUMER, 'process manga-locate'))).toMatchObject({
      'hikari.entry': 'queue',
      'hikari.entry_name': 'process manga-locate',
      'hikari.origin': 'queue',
    })
  })
})

describe('entry propagator', () => {
  it('injects origin and caller baggage derived from the active span', () => {
    const span = new FakeSpan(SpanKind.SERVER, 'GET /x', {
      'hikari.entry': 'http',
      'hikari.entry_name': 'GET /api/pages/galgame',
      'hikari.origin': 'browser',
      'hikari.origin_name': '/galgames/1',
    })
    const carrier: Record<string, string> = {}
    new EntryPropagator('hikari-web-ssr').inject(
      trace.setSpan(ROOT_CONTEXT, span as unknown as Span),
      carrier,
      { set: (c, k, v) => ((c as Record<string, string>)[k] = v) },
    )
    expect(carrier.traceparent).toBe('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')
    expect(carrier.baggage).toContain('hikari.origin=browser')
    expect(carrier.baggage).toContain('hikari.origin_name=%2Fgalgames%2F1')
    expect(carrier.baggage).toContain('hikari.caller=hikari-web-ssr')
    expect(carrier.baggage).toContain('hikari.caller_name=GET%20%2Fapi%2Fpages%2Fgalgame')
  })

  it('leaves the carrier untouched when nothing is active', () => {
    const carrier: Record<string, string> = {}
    new EntryPropagator('svc').inject(ROOT_CONTEXT, carrier, {
      set: (c, k, v) => ((c as Record<string, string>)[k] = v),
    })
    expect(carrier).toEqual({})
  })
})

describe('entry log processor', () => {
  it('copies the entry block and user from the active span onto records', () => {
    const span = new FakeSpan(SpanKind.SERVER, 'GET /x', {
      'hikari.entry': 'http',
      'hikari.entry_name': 'GET /x',
      'hikari.origin': 'external',
      'user.id': '42',
    })
    const record = {
      attributes: { 'hikari.entry_name': 'custom' } as Record<string, unknown>,
      setAttribute(key: string, value: unknown) {
        this.attributes[key] = value
      },
    }
    new EntryLogProcessor().onEmit(
      record as unknown as SdkLogRecord,
      trace.setSpan(ROOT_CONTEXT, span as unknown as Span),
    )
    expect(record.attributes).toEqual({
      'hikari.entry': 'http',
      'hikari.entry_name': 'custom',
      'hikari.origin': 'external',
      'user.id': '42',
    })
  })
})

describe('root classification', () => {
  it('maps span kinds to entries', () => {
    expect(classifyRoot(SpanKind.SERVER)).toBe('http')
    expect(classifyRoot(SpanKind.CONSUMER)).toBe('queue')
    expect(classifyRoot(SpanKind.PRODUCER)).toBe('queue')
    expect(classifyRoot(SpanKind.INTERNAL)).toBe('unknown')
    expect(classifyRoot(SpanKind.CLIENT)).toBe('unknown')
  })

  it('finds the first application frame of a stack', () => {
    const stack = [
      'Error',
      '    at new Span (/repo/node_modules/@opentelemetry/sdk-trace-base/build/src/Span.js:60:19)',
      '    at PrismaInstrumentation.start (/repo/node_modules/@prisma/instrumentation/dist/index.js:1:2)',
      '    at LocateSweeperService.sweep (/repo/services/api/dist/modules/manga-source/pipeline/locate-sweeper.service.js:42:15)',
      '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)',
    ].join('\n')
    expect(codeLocation(stack)).toEqual({
      file: '/repo/services/api/dist/modules/manga-source/pipeline/locate-sweeper.service.js',
      function: 'LocateSweeperService.sweep',
      line: 42,
    })
    expect(codeLocation('Error\n    at node:internal/main/run_main_module:28:49')).toEqual({})
    expect(codeLocation().file).toContain('entry.test')
  })
})

describe('entry sampler', () => {
  const traceId = '4bf92f3577b34da6a3ce929d0e0e4736'
  const decide = (
    rate: number,
    rates: Parameters<typeof entrySampler>[1],
    kind: SpanKind,
    attributes = {},
  ) =>
    entrySampler(rate, rates).shouldSample(ROOT_CONTEXT, traceId, 'x', kind, attributes, [])
      .decision

  it('samples roots by entry with the default as fallback', () => {
    expect(decide(1, { unknown: 0 }, SpanKind.SERVER)).toBe(SamplingDecision.RECORD_AND_SAMPLED)
    expect(decide(1, { unknown: 0 }, SpanKind.INTERNAL)).toBe(SamplingDecision.NOT_RECORD)
    expect(decide(0, { queue: 1 }, SpanKind.CONSUMER)).toBe(SamplingDecision.RECORD_AND_SAMPLED)
    expect(decide(0, { schedule: 1 }, SpanKind.INTERNAL, { 'hikari.entry': 'schedule' })).toBe(
      SamplingDecision.RECORD_AND_SAMPLED,
    )
    expect(decide(0, {}, SpanKind.SERVER)).toBe(SamplingDecision.NOT_RECORD)
  })

  it('drops BullMQ housekeeping roots regardless of rate', () => {
    const name = (spanName: string, kind: SpanKind) =>
      entrySampler(1).shouldSample(ROOT_CONTEXT, traceId, spanName, kind, {}, []).decision
    expect(name('startStalledCheckTimer manga-locate', SpanKind.INTERNAL)).toBe(
      SamplingDecision.NOT_RECORD,
    )
    expect(name('getNextJob search-index', SpanKind.INTERNAL)).toBe(SamplingDecision.NOT_RECORD)
    expect(name('process manga-locate', SpanKind.CONSUMER)).toBe(
      SamplingDecision.RECORD_AND_SAMPLED,
    )
    expect(name('add manga-locate.locate', SpanKind.PRODUCER)).toBe(
      SamplingDecision.RECORD_AND_SAMPLED,
    )
  })
})

describe('schedule ticks', () => {
  it('names ticks after the owning class and method', () => {
    class LocateSweeperService {
      sweep() {
        return 1
      }
    }
    const instance = new LocateSweeperService()
    expect(nameOf(instance, instance.sweep)).toBe('LocateSweeperService.sweep')
    expect(nameOf({}, function run() {})).toBe('Object.run')
  })

  it('keeps this, arguments, return values and rejections', async () => {
    const owner = { base: 40, add: undefined as unknown }
    const wrapped = tick('Owner.add', function (this: typeof owner, n: number) {
      return Promise.resolve(this.base + n)
    })
    await expect(wrapped.call(owner, 2)).resolves.toBe(42)
    const failing = tick('Owner.fail', () => Promise.reject(new Error('boom')))
    await expect(failing()).rejects.toThrow('boom')
    const sync = tick('Owner.sync', (n: number) => n * 2)
    expect(sync(21)).toBe(42)
    expect(() =>
      tick('Owner.throw', () => {
        throw new Error('sync boom')
      })(),
    ).toThrow('sync boom')
  })
})
