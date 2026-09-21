import { nanos } from './ids.js'
import type {
  AttributeValue,
  Attributes,
  LogRecord,
  SpanKind,
  SpanRecord,
  StatusCode,
} from './types.js'

const SPAN_KINDS: Record<SpanKind, number> = {
  internal: 1,
  server: 2,
  client: 3,
  producer: 4,
  consumer: 5,
}
const STATUS_CODES: Record<StatusCode, number> = { unset: 0, ok: 1, error: 2 }

interface KeyValue {
  key: string
  value: Record<string, unknown>
}

export function anyValue(value: AttributeValue): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { boolValue: value }
  if (typeof value === 'number') {
    if (Number.isInteger(value) && Number.isSafeInteger(value)) return { intValue: String(value) }
    if (Number.isFinite(value)) return { doubleValue: value }
    return null
  }
  return { stringValue: String(value) }
}

export function keyValues(attributes: Attributes): KeyValue[] {
  const out: KeyValue[] = []
  for (const [key, raw] of Object.entries(attributes)) {
    const value = anyValue(raw)
    if (key && value) out.push({ key, value })
  }
  return out
}

export function encodeSpans(resource: Attributes, scope: string, spans: SpanRecord[]): string {
  return JSON.stringify({
    resourceSpans: [
      {
        resource: { attributes: keyValues(resource) },
        scopeSpans: [
          {
            scope: { name: scope },
            spans: spans.map(span => ({
              traceId: span.traceId,
              spanId: span.spanId,
              ...(span.parentSpanId ? { parentSpanId: span.parentSpanId } : {}),
              name: span.name,
              kind: SPAN_KINDS[span.kind],
              startTimeUnixNano: nanos(span.startMs),
              endTimeUnixNano: nanos(span.endMs),
              flags: span.sampled ? 257 : 256,
              attributes: keyValues(span.attributes),
              status: {
                code: STATUS_CODES[span.status.code],
                ...(span.status.message ? { message: span.status.message } : {}),
              },
            })),
          },
        ],
      },
    ],
  })
}

export function encodeLogs(resource: Attributes, scope: string, logs: LogRecord[]): string {
  return JSON.stringify({
    resourceLogs: [
      {
        resource: { attributes: keyValues(resource) },
        scopeLogs: [
          {
            scope: { name: scope },
            logRecords: logs.map(log => ({
              timeUnixNano: nanos(log.timeMs),
              severityNumber: log.severity,
              ...(log.body !== undefined ? { body: { stringValue: log.body } } : {}),
              ...(log.eventName ? { eventName: log.eventName } : {}),
              attributes: keyValues(log.attributes),
              ...(log.traceId ? { traceId: log.traceId } : {}),
              ...(log.spanId ? { spanId: log.spanId } : {}),
            })),
          },
        ],
      },
    ],
  })
}
