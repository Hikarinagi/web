import { IncomingMessage } from 'node:http'

import { context, propagation, trace, type Attributes, type Span } from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import type { Instrumentation } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import type { Telemetry as BullTelemetry } from 'bullmq'

import { captureError, failSpan, log, track, type LogLevel } from './api'
import {
  ATTR_ORIGIN,
  ATTR_ORIGIN_NAME,
  ATTR_USER_ID,
  EntryLogProcessor,
  EntryProcessor,
  EntryPropagator,
  entrySampler,
  ORIGIN_EXTERNAL,
  SCOPE,
  type SampleRates,
} from './entry'

export {
  ATTR_CALLER,
  ATTR_CALLER_NAME,
  ATTR_ENTRY,
  ATTR_ENTRY_NAME,
  ATTR_ORIGIN,
  ATTR_ORIGIN_NAME,
  ATTR_USER_ID,
  ENTRIES,
  SCOPE,
  type Entry,
  type SampleRates,
} from './entry'
export { captureError, errorParts, failSpan, log, track, type LogLevel } from './api'
export { tick } from './schedule'

export const ATTR_REQUEST_ID = 'hikari.request_id'

export interface NodeTelemetryOptions {
  service: string
  version: string
  environment: string
  endpoint: string
  key: string
  sampleRate?: number
  sampleRates?: SampleRates
  instrumentations?: Instrumentation[]
  resourceAttributes?: Attributes
  ignoreIncomingPaths?: string[]
  flushIntervalMs?: number
  requestIdHeader?: string
}

export interface NodeTelemetry {
  readonly enabled: boolean
  track(name: string, attributes?: Attributes): void
  captureError(error: unknown, attributes?: Attributes): void
  log(level: LogLevel, message: string, attributes?: Attributes): void
  failSpan(error: unknown, attributes?: Attributes): void
  flush(): Promise<void>
  shutdown(): Promise<void>
}

const disabled: NodeTelemetry = {
  enabled: false,
  track: () => undefined,
  captureError: () => undefined,
  log: () => undefined,
  failSpan: () => undefined,
  flush: () => Promise.resolve(),
  shutdown: () => Promise.resolve(),
}

let active: NodeTelemetry = disabled
const serverSpans = new WeakMap<IncomingMessage, Span>()

export function startNodeTelemetry(options: NodeTelemetryOptions): NodeTelemetry {
  const endpoint = options.endpoint.replace(/\/$/, '')
  const headers = { Authorization: `Bearer ${options.key}` }
  const ignored = options.ignoreIncomingPaths ?? ['/health']
  const ignoredPath = (url: string) => {
    const path = url.split('?')[0] ?? ''
    return ignored.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
  }
  const delay = options.flushIntervalMs ?? 2000
  const spanProcessor = new BatchSpanProcessor(
    new OTLPTraceExporter({ url: `${endpoint}/v1/traces`, headers }),
    { scheduledDelayMillis: delay },
  )
  const logProcessor = new BatchLogRecordProcessor({
    exporter: new OTLPLogExporter({ url: `${endpoint}/v1/logs`, headers }),
    scheduledDelayMillis: delay,
  })
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: options.service,
      [ATTR_SERVICE_VERSION]: options.version,
      'deployment.environment': options.environment,
      ...(options.resourceAttributes ?? {}),
    }),
    sampler: entrySampler(options.sampleRate ?? 1, options.sampleRates),
    textMapPropagator: new EntryPropagator(options.service),
    spanProcessors: [new EntryProcessor(), spanProcessor],
    logRecordProcessors: [new EntryLogProcessor(), logProcessor],
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: request => ignoredPath(request.url ?? ''),
        requestHook: (span, request) => {
          if (!(request instanceof IncomingMessage)) return
          serverSpans.set(request, span)
          if (isDocumentRequest(request) && originOf(span) === ORIGIN_EXTERNAL) {
            span.setAttributes({
              [ATTR_ORIGIN]: 'browser',
              [ATTR_ORIGIN_NAME]: (request.url ?? '/').split('?')[0] ?? '/',
            })
          }
        },
        responseHook: (span, response) => {
          const requestId = responseHeader(response, options.requestIdHeader)
          if (requestId) span.setAttribute(ATTR_REQUEST_ID, requestId)
        },
      }),
      new UndiciInstrumentation(),
      ...(options.instrumentations ?? []),
    ],
  })
  sdk.start()
  const stop = () => {
    void sdk.shutdown().catch(() => undefined)
  }
  process.once('SIGTERM', stop)
  process.once('SIGINT', stop)
  const telemetry: NodeTelemetry = {
    enabled: true,
    track,
    captureError,
    log,
    failSpan,
    flush: () =>
      Promise.all([spanProcessor.forceFlush(), logProcessor.forceFlush()]).then(() => undefined),
    shutdown: () => sdk.shutdown(),
  }
  active = telemetry
  return telemetry
}

export function startNodeTelemetryFromEnv(
  service: string,
  version: string,
  extra: Partial<Omit<NodeTelemetryOptions, 'service' | 'version' | 'endpoint' | 'key'>> = {},
  env: NodeJS.ProcessEnv = process.env,
): NodeTelemetry {
  const endpoint = env.APM_ENDPOINT?.trim()
  const key = env.APM_INGEST_KEY?.trim()
  if (!endpoint || !key) return disabled
  const rate = Number(env.APM_SAMPLE_RATE ?? '1')
  return startNodeTelemetry({
    service,
    version,
    endpoint,
    key,
    environment: extra.environment ?? env.APM_ENVIRONMENT?.trim() ?? 'unknown',
    sampleRate: Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 1,
    ...extra,
  })
}

export function telemetry(): NodeTelemetry {
  return active
}

export function identify(userId: string | number, request?: IncomingMessage): void {
  const id = String(userId)
  if (!id) return
  trace.getActiveSpan()?.setAttribute(ATTR_USER_ID, id)
  if (request) serverSpans.get(request)?.setAttribute(ATTR_USER_ID, id)
}

export function currentTraceparent(): string | undefined {
  const carrier: Record<string, string> = {}
  propagation.inject(context.active(), carrier)
  return carrier.traceparent
}

export function setSpanAttributes(attributes: Attributes): void {
  trace.getActiveSpan()?.setAttributes(attributes)
}

export function spanOfRequest(request: IncomingMessage): Span | undefined {
  return serverSpans.get(request)
}

export function bullmqTelemetry(): BullTelemetry | undefined {
  if (!active.enabled) return undefined
  const { BullMQOtel } = require('bullmq-otel') as {
    BullMQOtel: new (options: { tracerName: string }) => BullTelemetry
  }
  return new BullMQOtel({ tracerName: SCOPE })
}

export function esmHookPath(): string {
  return require.resolve('@opentelemetry/instrumentation/hook.mjs')
}

function isDocumentRequest(request: IncomingMessage): boolean {
  const accept = request.headers.accept
  const value = Array.isArray(accept) ? accept.join(',') : (accept ?? '')
  return (request.method ?? 'GET') === 'GET' && value.includes('text/html')
}

function originOf(span: Span): string | undefined {
  const value = (span as { attributes?: Attributes }).attributes?.[ATTR_ORIGIN]
  return typeof value === 'string' ? value : undefined
}

function responseHeader(
  response: { getHeader?: (name: string) => unknown; headers?: Record<string, unknown> },
  name: string | undefined,
): string | undefined {
  if (!name) return undefined
  const raw = response.getHeader ? response.getHeader(name) : response.headers?.[name.toLowerCase()]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
