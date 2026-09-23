export type AttributeValue = string | number | boolean | null | undefined

export type Attributes = Record<string, AttributeValue>

export type SpanKind = 'internal' | 'server' | 'client' | 'producer' | 'consumer'

export type StatusCode = 'unset' | 'ok' | 'error'

export interface SpanRecord {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  kind: SpanKind
  startMs: number
  endMs: number
  status: { code: StatusCode; message?: string }
  attributes: Attributes
  sampled: boolean
}

export interface LogRecord {
  timeMs: number
  severity: number
  body?: string
  eventName?: string
  attributes: Attributes
  traceId?: string
  spanId?: string
}

export interface ApmOptions {
  endpoint: string
  key: string
  service: string
  version: string
  environment: string
  sampleRate?: number
  flushIntervalMs?: number
  maxQueue?: number
  maxBatch?: number
  maxBatchBytes?: number
  errorsPerMinute?: number
  queryAllowList?: readonly string[]
  fetch?: typeof fetch
  now?: () => number
  random?: () => number
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null
  resourceAttributes?: Attributes
}

export interface SpanOptions {
  kind?: SpanKind
  attributes?: Attributes
  parent?: { traceId: string; spanId: string; sampled: boolean }
}

export interface SpanEnd {
  status?: StatusCode
  message?: string
  attributes?: Attributes
}

export interface Span {
  readonly traceId: string
  readonly spanId: string
  readonly sampled: boolean
  traceparent(): string
  setAttribute(key: string, value: AttributeValue): void
  end(end?: SpanEnd): void
}

export interface PageView {
  path: string
  route?: string
  query?: string
  title?: string
  referrer?: string
}

export interface Apm {
  readonly sessionId: string
  baggage(): string
  startSpan(name: string, options?: SpanOptions): Span
  track(name: string, properties?: Attributes): void
  pageView(view: PageView): void
  identify(userId: string | null): void
  captureError(error: unknown, context?: Attributes): void
  installGlobalHandlers(): () => void
  flush(): Promise<void>
  shutdown(): Promise<void>
}
