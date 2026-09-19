import { encodeLogs, encodeSpans } from './otlp.js'
import type { Attributes, LogRecord, SpanRecord } from './types.js'

export interface ExporterOptions {
  endpoint: string
  key: string
  scope: string
  resource: Attributes
  fetch: typeof fetch
  flushIntervalMs: number
  maxQueue: number
  maxBatch: number
  maxBatchBytes: number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

const RETRYABLE = new Set([408, 429, 502, 503, 504])
const MAX_ATTEMPTS = 3

interface Batch<T> {
  items: T[]
  attempts: number
}

class Lane<T> {
  private items: T[] = []
  private retrying: Batch<T>[] = []

  constructor(
    private readonly path: string,
    private readonly encode: (items: T[]) => string,
    private readonly opts: ExporterOptions,
  ) {}

  enqueue(item: T): void {
    this.items.push(item)
    if (this.items.length > this.opts.maxQueue)
      this.items.splice(0, this.items.length - this.opts.maxQueue)
  }

  get size(): number {
    return this.items.length + this.retrying.reduce((sum, batch) => sum + batch.items.length, 0)
  }

  async flush(): Promise<void> {
    const batches = this.retrying
    this.retrying = []
    while (this.items.length > 0) {
      batches.push({ items: this.items.splice(0, this.opts.maxBatch), attempts: 0 })
    }
    for (const batch of batches) await this.send(batch)
  }

  private async send(batch: Batch<T>): Promise<void> {
    const body = this.encode(batch.items)
    if (body.length > this.opts.maxBatchBytes && batch.items.length > 1) {
      const half = Math.ceil(batch.items.length / 2)
      await this.send({ items: batch.items.slice(0, half), attempts: batch.attempts })
      await this.send({ items: batch.items.slice(half), attempts: batch.attempts })
      return
    }
    let retry = false
    try {
      const response = await this.opts.fetch(`${this.opts.endpoint}${this.path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.opts.key}`, 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      })
      retry = RETRYABLE.has(response.status)
    } catch {
      retry = true
    }
    if (retry && batch.attempts + 1 < MAX_ATTEMPTS) {
      this.retrying.push({ items: batch.items, attempts: batch.attempts + 1 })
    }
  }
}

export class Exporter {
  private readonly spans: Lane<SpanRecord>
  private readonly logs: Lane<LogRecord>
  private timer: unknown = null
  private stopped = false
  private inflight: Promise<void> | null = null

  constructor(private readonly opts: ExporterOptions) {
    this.spans = new Lane(
      '/v1/traces',
      items => encodeSpans(opts.resource, opts.scope, items),
      opts,
    )
    this.logs = new Lane('/v1/logs', items => encodeLogs(opts.resource, opts.scope, items), opts)
  }

  span(record: SpanRecord): void {
    if (this.stopped) return
    this.spans.enqueue(record)
    this.schedule()
  }

  log(record: LogRecord): void {
    if (this.stopped) return
    this.logs.enqueue(record)
    this.schedule()
  }

  get pending(): number {
    return this.spans.size + this.logs.size
  }

  flush(): Promise<void> {
    if (this.inflight) return this.inflight
    this.cancelTimer()
    this.inflight = Promise.all([this.spans.flush(), this.logs.flush()])
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        this.inflight = null
        if (!this.stopped && this.pending > 0) this.schedule()
      })
    return this.inflight
  }

  async shutdown(): Promise<void> {
    await this.flush()
    this.stopped = true
    this.cancelTimer()
  }

  private schedule(): void {
    if (this.timer !== null || this.stopped) return
    const setTimer = this.opts.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
    this.timer = setTimer(() => {
      this.timer = null
      void this.flush()
    }, this.opts.flushIntervalMs)
  }

  private cancelTimer(): void {
    if (this.timer === null) return
    const clearTimer =
      this.opts.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>))
    clearTimer(this.timer)
    this.timer = null
  }
}
