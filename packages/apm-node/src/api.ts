import { SpanStatusCode, trace, type Attributes } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'

export const SCOPE = '@hikarinagi/apm-node'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const SEVERITY: Record<LogLevel, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
  fatal: SeverityNumber.FATAL,
}

const STACK_LIMIT = 16 * 1024

export function errorParts(error: unknown): { type: string; message: string; stack?: string } {
  if (error instanceof Error)
    return { type: error.name || 'Error', message: error.message, stack: error.stack }
  if (typeof error === 'string') return { type: 'Error', message: error }
  try {
    return { type: 'Error', message: JSON.stringify(error) }
  } catch {
    return { type: 'Error', message: String(error) }
  }
}

export function track(name: string, attributes: Attributes = {}): void {
  if (!name) return
  logs
    .getLogger(SCOPE)
    .emit({ eventName: name, body: name, severityNumber: SeverityNumber.INFO, attributes })
}

export function captureError(error: unknown, attributes: Attributes = {}): void {
  const parts = errorParts(error)
  logs.getLogger(SCOPE).emit({
    body: parts.message || parts.type,
    severityNumber: SeverityNumber.ERROR,
    attributes: {
      'exception.type': parts.type,
      'exception.message': parts.message,
      ...(parts.stack ? { 'exception.stacktrace': parts.stack.slice(0, STACK_LIMIT) } : {}),
      ...attributes,
    },
  })
}

export function log(level: LogLevel, message: string, attributes: Attributes = {}): void {
  if (!message) return
  logs.getLogger(SCOPE).emit({
    body: message,
    severityNumber: SEVERITY[level],
    severityText: level,
    attributes,
  })
}

export function failSpan(error: unknown, attributes: Attributes = {}): void {
  const span = trace.getActiveSpan()
  if (!span) return
  const parts = errorParts(error)
  span.recordException(error instanceof Error ? error : parts.message)
  span.setStatus({ code: SpanStatusCode.ERROR, message: parts.message.slice(0, 1024) })
  span.setAttributes(attributes)
}
