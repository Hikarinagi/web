import { Exporter } from './exporter.js'
import { newSpanId, newTraceId, traceparent } from './ids.js'
import { DEFAULT_QUERY_ALLOW_LIST, pathOf, redactQuery, truncate } from './redact.js'
import { Session, type SessionStorageLike } from './session.js'
import type {
  Apm,
  ApmOptions,
  AttributeValue,
  Attributes,
  LogRecord,
  PageView,
  Span,
  SpanEnd,
  SpanOptions,
  SpanRecord,
} from './types.js'

export const SEVERITY = { info: 9, error: 17 } as const
export const EVENT_PAGE_VIEW = 'page_view'

const SCOPE = '@hikarinagi/apm-browser'
const ENTRY = 'browser'

function defaultStorage(): SessionStorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function errorParts(error: unknown): { type: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return { type: error.name || 'Error', message: error.message, stack: error.stack }
  }
  if (typeof error === 'string') return { type: 'Error', message: error }
  try {
    return { type: 'Error', message: JSON.stringify(error) }
  } catch {
    return { type: 'Error', message: String(error) }
  }
}

export function createApm(options: ApmOptions): Apm {
  const now = options.now ?? (() => Date.now())
  const random = options.random ?? Math.random
  const sampleRate = options.sampleRate ?? 0.05
  const queryAllow = options.queryAllowList ?? DEFAULT_QUERY_ALLOW_LIST
  const session = new Session(
    options.storage === undefined ? defaultStorage() : options.storage,
    now,
  )
  const resource: Attributes = {
    'service.name': options.service,
    'service.version': options.version,
    'deployment.environment': options.environment,
    ...(typeof navigator !== 'undefined'
      ? { 'user_agent.original': navigator.userAgent, 'browser.language': navigator.language }
      : {}),
    ...(options.resourceAttributes ?? {}),
  }
  const exporter = new Exporter({
    endpoint: options.endpoint.replace(/\/$/, ''),
    key: options.key,
    scope: SCOPE,
    resource,
    fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    flushIntervalMs: options.flushIntervalMs ?? 5000,
    maxQueue: options.maxQueue ?? 500,
    maxBatch: options.maxBatch ?? 50,
    maxBatchBytes: options.maxBatchBytes ?? 48 * 1024,
  })
  const errorBudget = { windowStart: now(), used: 0, limit: options.errorsPerMinute ?? 20 }
  let userId: string | null = null
  let currentPath = typeof location === 'undefined' ? '' : pathOf(location.pathname).path

  function identity(): Attributes {
    return {
      'session.id': session.id,
      ...(userId ? { 'user.id': userId } : {}),
      ...(currentPath ? { 'url.path': currentPath } : {}),
      'hikari.entry': ENTRY,
      'hikari.entry_name': currentPath,
      'hikari.origin': ENTRY,
      'hikari.origin_name': currentPath,
    }
  }

  function emitLog(record: Omit<LogRecord, 'attributes'> & { attributes?: Attributes }): void {
    exporter.log({ ...record, attributes: { ...identity(), ...(record.attributes ?? {}) } })
  }

  function allowError(): boolean {
    const at = now()
    if (at - errorBudget.windowStart >= 60_000) {
      errorBudget.windowStart = at
      errorBudget.used = 0
    }
    if (errorBudget.used >= errorBudget.limit) return false
    errorBudget.used += 1
    return true
  }

  const apm: Apm = {
    get sessionId() {
      return session.id
    },

    baggage(): string {
      const path = encodeURIComponent(currentPath)
      const service = encodeURIComponent(options.service)
      return `hikari.origin=${ENTRY},hikari.origin_name=${path},hikari.caller=${service},hikari.caller_name=${path}`
    },

    startSpan(name: string, spanOptions: SpanOptions = {}): Span {
      const parent = spanOptions.parent
      const traceId = parent?.traceId ?? newTraceId()
      const spanId = newSpanId()
      const sampled = parent ? parent.sampled : random() < sampleRate
      const startMs = now()
      const attributes: Attributes = { ...identity(), ...(spanOptions.attributes ?? {}) }
      let ended = false
      return {
        traceId,
        spanId,
        sampled,
        traceparent: () => traceparent(traceId, spanId, sampled),
        setAttribute(key: string, value: AttributeValue) {
          attributes[key] = value
        },
        end(end: SpanEnd = {}) {
          if (ended) return
          ended = true
          const status = end.status ?? 'unset'
          if (!sampled && status !== 'error') return
          const record: SpanRecord = {
            traceId,
            spanId,
            ...(parent ? { parentSpanId: parent.spanId } : {}),
            name,
            kind: spanOptions.kind ?? 'client',
            startMs,
            endMs: now(),
            status: { code: status, ...(end.message ? { message: end.message } : {}) },
            attributes: { ...attributes, ...(end.attributes ?? {}) },
            sampled,
          }
          exporter.span(record)
        },
      }
    },

    track(name: string, properties: Attributes = {}): void {
      if (!name) return
      emitLog({ timeMs: now(), severity: SEVERITY.info, eventName: name, attributes: properties })
    },

    pageView(view: PageView): void {
      const { path, query } = pathOf(view.path)
      currentPath = path
      const referrer = view.referrer ? pathOf(view.referrer) : null
      apm.track(EVENT_PAGE_VIEW, {
        'url.path': path,
        ...(query || view.query
          ? { 'url.query': redactQuery(view.query ?? query, queryAllow) }
          : {}),
        ...(view.title ? { 'page.title': view.title } : {}),
        ...(referrer ? { 'page.referrer': referrer.path } : {}),
      })
    },

    identify(id: string | null): void {
      userId = id && id.length > 0 ? id : null
    },

    captureError(error: unknown, context: Attributes = {}): void {
      if (!allowError()) return
      const parts = errorParts(error)
      emitLog({
        timeMs: now(),
        severity: SEVERITY.error,
        body: parts.message || parts.type,
        attributes: {
          'exception.type': parts.type,
          'exception.message': parts.message,
          ...(parts.stack ? { 'exception.stacktrace': truncate(parts.stack) } : {}),
          ...context,
        },
      })
    },

    installGlobalHandlers(): () => void {
      if (typeof window === 'undefined') return () => {}
      const onError = (event: ErrorEvent) => {
        apm.captureError(event.error ?? event.message, {
          'code.filepath': event.filename,
          'code.lineno': event.lineno,
          'code.column': event.colno,
        })
      }
      const onRejection = (event: PromiseRejectionEvent) => {
        apm.captureError(event.reason, { 'exception.unhandled_rejection': true })
      }
      const onHide = () => {
        if (document.visibilityState === 'hidden') void exporter.flush()
      }
      window.addEventListener('error', onError)
      window.addEventListener('unhandledrejection', onRejection)
      window.addEventListener('pagehide', onHide)
      document.addEventListener('visibilitychange', onHide)
      return () => {
        window.removeEventListener('error', onError)
        window.removeEventListener('unhandledrejection', onRejection)
        window.removeEventListener('pagehide', onHide)
        document.removeEventListener('visibilitychange', onHide)
      }
    },

    flush: () => exporter.flush(),
    shutdown: () => exporter.shutdown(),
  }
  return apm
}
