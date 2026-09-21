import { basename } from 'node:path'

import {
  context as apiContext,
  propagation,
  SpanKind,
  trace,
  type Attributes,
  type AttributeValue,
  type Context,
  type TextMapGetter,
  type TextMapPropagator,
  type TextMapSetter,
} from '@opentelemetry/api'
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core'
import type { LogRecordProcessor, SdkLogRecord } from '@opentelemetry/sdk-logs'
import {
  ParentBasedSampler,
  SamplingDecision,
  TraceIdRatioBasedSampler,
  type Sampler,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base'

import { SCOPE } from './api'

export { SCOPE }
export const ATTR_ENTRY = 'hikari.entry'
export const ATTR_ENTRY_NAME = 'hikari.entry_name'
export const ATTR_ORIGIN = 'hikari.origin'
export const ATTR_ORIGIN_NAME = 'hikari.origin_name'
export const ATTR_CALLER = 'hikari.caller'
export const ATTR_CALLER_NAME = 'hikari.caller_name'
export const ATTR_USER_ID = 'user.id'
export const ATTR_CODE_FUNCTION = 'code.function.name'
export const ATTR_CODE_FILE = 'code.file.path'
export const ATTR_CODE_LINE = 'code.line.number'
export const ORIGIN_EXTERNAL = 'external'

export const ENTRIES = ['http', 'queue', 'schedule', 'browser', 'mobile', 'unknown'] as const
export type Entry = (typeof ENTRIES)[number]

const INHERITED = [
  ATTR_ENTRY,
  ATTR_ENTRY_NAME,
  ATTR_ORIGIN,
  ATTR_ORIGIN_NAME,
  ATTR_CALLER,
  ATTR_CALLER_NAME,
] as const

export function classifyRoot(kind: SpanKind): Entry {
  if (kind === SpanKind.SERVER) return 'http'
  if (kind === SpanKind.CONSUMER || kind === SpanKind.PRODUCER) return 'queue'
  return 'unknown'
}

export interface CodeLocation {
  file?: string
  function?: string
  line?: number
}

export function codeLocation(stack = captureStack()): CodeLocation {
  for (const line of stack.split('\n').slice(1)) {
    const match = /at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line.trim())
    if (!match) continue
    const file = match[2]!
    if (
      file.includes('/node_modules/') ||
      file.startsWith('node:') ||
      file.includes('/apm-node/src/') ||
      file.includes('/apm-node/dist/') ||
      file.startsWith('internal/')
    )
      continue
    return { file, function: match[1], line: Number(match[3]) }
  }
  return {}
}

function captureStack(): string {
  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 40
  try {
    return new Error().stack ?? ''
  } finally {
    Error.stackTraceLimit = limit
  }
}

function attributesOf(span: unknown): Attributes | undefined {
  const attributes = (span as { attributes?: Attributes } | undefined)?.attributes
  return attributes && typeof attributes === 'object' ? attributes : undefined
}

function text(value: AttributeValue | undefined): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function requestName(span: Span): string {
  const method = text(span.attributes['http.request.method'])
  const path = text(span.attributes['url.path']) ?? text(span.attributes['http.route'])
  return method && path ? `${method} ${path}` : span.name
}

function entryNameOf(entry: Entry, span: Span): string {
  if (entry === 'http') return requestName(span)
  if (entry !== 'unknown') return span.name
  const location = codeLocation()
  if (!location.file) return requestName(span)
  span.setAttributes({
    [ATTR_CODE_FILE]: location.file,
    [ATTR_CODE_LINE]: location.line ?? 0,
    ...(location.function ? { [ATTR_CODE_FUNCTION]: location.function } : {}),
  })
  return location.function ?? `${basename(location.file)}:${location.line ?? 0}`
}

export class EntryProcessor implements SpanProcessor {
  onStart(span: Span, parentContext: Context): void {
    if (text(span.attributes[ATTR_ENTRY])) {
      fillOrigin(span, parentContext)
      return
    }
    const parent = attributesOf(trace.getSpan(parentContext))
    if (parent && text(parent[ATTR_ENTRY])) {
      const inherited: Attributes = {}
      for (const key of INHERITED) {
        const value = text(parent[key])
        if (value) inherited[key] = value
      }
      span.setAttributes(inherited)
      return
    }
    const entry = classifyRoot(span.kind)
    span.setAttribute(ATTR_ENTRY, entry)
    span.setAttribute(ATTR_ENTRY_NAME, entryNameOf(entry, span))
    fillOrigin(span, parentContext)
  }

  onEnd(): void {}

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

function fillOrigin(span: Span, parentContext: Context): void {
  const attributes = span.attributes
  const baggage = propagation.getBaggage(parentContext)
  const carried = (key: string) => text(baggage?.getEntry(key)?.value)
  if (!text(attributes[ATTR_ORIGIN])) {
    const origin = carried(ATTR_ORIGIN)
    if (origin) {
      span.setAttributes({
        [ATTR_ORIGIN]: origin,
        [ATTR_ORIGIN_NAME]: carried(ATTR_ORIGIN_NAME) ?? '',
      })
    } else if (span.kind === SpanKind.SERVER) {
      span.setAttributes({
        [ATTR_ORIGIN]: ORIGIN_EXTERNAL,
        [ATTR_ORIGIN_NAME]: text(attributes['user_agent.original']) ?? '',
      })
    } else {
      span.setAttributes({
        [ATTR_ORIGIN]: text(attributes[ATTR_ENTRY]) ?? 'unknown',
        [ATTR_ORIGIN_NAME]: text(attributes[ATTR_ENTRY_NAME]) ?? '',
      })
    }
  }
  const caller = carried(ATTR_CALLER)
  if (caller && !text(attributes[ATTR_CALLER])) {
    span.setAttributes({
      [ATTR_CALLER]: caller,
      [ATTR_CALLER_NAME]: carried(ATTR_CALLER_NAME) ?? '',
    })
  }
}

export class EntryPropagator implements TextMapPropagator {
  private readonly inner = new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  })

  constructor(private readonly service: string) {}

  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    const attributes = attributesOf(trace.getSpan(context))
    const entry = attributes && text(attributes[ATTR_ENTRY])
    if (!attributes || !entry) {
      this.inner.inject(context, carrier, setter)
      return
    }
    const entryName = text(attributes[ATTR_ENTRY_NAME]) ?? ''
    const entries: Array<[string, string]> = [
      [ATTR_ORIGIN, text(attributes[ATTR_ORIGIN]) ?? entry],
      [ATTR_ORIGIN_NAME, text(attributes[ATTR_ORIGIN_NAME]) ?? entryName],
      [ATTR_CALLER, this.service],
      [ATTR_CALLER_NAME, entryName],
    ]
    let baggage = propagation.getBaggage(context) ?? propagation.createBaggage()
    for (const [key, value] of entries) {
      if (value) baggage = baggage.setEntry(key, { value })
    }
    this.inner.inject(propagation.setBaggage(context, baggage), carrier, setter)
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    return this.inner.extract(context, carrier, getter)
  }

  fields(): string[] {
    return this.inner.fields()
  }
}

export class EntryLogProcessor implements LogRecordProcessor {
  onEmit(logRecord: SdkLogRecord, context?: Context): void {
    const attributes = attributesOf(trace.getSpan(context ?? apiContext.active()))
    if (!attributes || !text(attributes[ATTR_ENTRY])) return
    for (const key of [...INHERITED, ATTR_USER_ID]) {
      const value = text(attributes[key])
      if (value && logRecord.attributes[key] === undefined) logRecord.setAttribute(key, value)
    }
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

export type SampleRates = Partial<Record<Entry, number>>

export function entrySampler(defaultRate: number, rates: SampleRates = {}): Sampler {
  const ratios = new Map<number, TraceIdRatioBasedSampler>()
  const ratio = (rate: number) => {
    let sampler = ratios.get(rate)
    if (!sampler) {
      sampler = new TraceIdRatioBasedSampler(rate)
      ratios.set(rate, sampler)
    }
    return sampler
  }
  const root: Sampler = {
    shouldSample(context, traceId, spanName, spanKind, attributes) {
      if (isHousekeeping(spanName, spanKind)) return { decision: SamplingDecision.NOT_RECORD }
      const entry = (text(attributes[ATTR_ENTRY]) as Entry | undefined) ?? classifyRoot(spanKind)
      return ratio(rates[entry] ?? defaultRate).shouldSample(context, traceId)
    },
    toString: () => 'EntrySampler',
  }
  return new ParentBasedSampler({ root })
}

const HOUSEKEEPING = [
  'startStalledCheckTimer ',
  'moveStalledJobsToWait ',
  'getNextJob ',
  'extendLocks ',
  'rateLimit ',
]

export function isHousekeeping(spanName: string, spanKind: SpanKind): boolean {
  return spanKind === SpanKind.INTERNAL && HOUSEKEEPING.some(prefix => spanName.startsWith(prefix))
}
