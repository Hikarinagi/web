import { pathOf } from './redact.js'
import type { Apm, Attributes, FetchOutcome, SpanEnd } from './types.js'

export interface FetchInstrumentationOptions {
  origin: string
  firstPartyOrigins?: readonly string[]
  requestIdHeader?: string
  ignore?: (url: string) => boolean
}

export const ATTR_OUTCOME = 'hikari.outcome'

const PATCHED = Symbol.for('hikarinagi.apm.fetch')

type FetchLike = typeof fetch & { [PATCHED]?: boolean }

export function instrumentFetch(apm: Apm, options: FetchInstrumentationOptions): () => void {
  const target = globalThis as { fetch?: FetchLike }
  const original = target.fetch
  if (!original || original[PATCHED]) return () => {}
  const requestIdHeader = (options.requestIdHeader ?? 'hikari-request-id').toLowerCase()
  const firstParty = new Set([options.origin, ...(options.firstPartyOrigins ?? [])])

  const patched: FetchLike = async function (
    this: unknown,
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const url = urlOf(input, options.origin)
    if (options.ignore?.(url)) return original.call(this, input, init)
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const target = targetOf(url, options.origin)
    const same = target?.origin === options.origin
    const own = target ? firstParty.has(target.origin) : true
    const path = target ? target.pathname : pathOf(url, options.origin).path
    const attributes: Attributes = { 'http.request.method': method, 'url.path': path }
    if (target) {
      attributes['server.address'] = target.hostname
      attributes['url.scheme'] = target.protocol.slice(0, -1)
      if (target.port) attributes['server.port'] = Number(target.port)
    }
    const span = apm.startSpan(
      same || !target ? `${method} ${path}` : `${method} ${target.host}${path}`,
      { kind: 'client', attributes },
    )
    let request = init
    if (same) {
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      )
      headers.set('traceparent', span.traceparent())
      headers.set('baggage', apm.baggage())
      request = { ...init, headers }
    }
    try {
      const response = await original.call(this, input, request)
      span.end(await outcomeOf(response, requestIdHeader, own))
      return response
    } catch (error) {
      span.end(failureOf(error, own))
      throw error
    }
  }
  patched[PATCHED] = true
  target.fetch = patched
  return () => {
    if (target.fetch === patched) target.fetch = original
  }
}

async function outcomeOf(
  response: Response,
  requestIdHeader: string,
  own: boolean,
): Promise<SpanEnd> {
  const attributes: Attributes = { 'http.response.status_code': response.status }
  let requestId = response.headers.get(requestIdHeader) ?? undefined
  let code: string | undefined
  if (!response.ok && /json/i.test(response.headers.get('content-type') ?? '')) {
    try {
      const body = (await response.clone().json()) as {
        request_id?: unknown
        error?: { code?: unknown }
      } | null
      if (typeof body?.request_id === 'string') requestId ??= body.request_id
      if (typeof body?.error?.code === 'string') code = body.error.code
    } catch {
      /* body was not the api envelope */
    }
  }
  if (requestId) attributes['hikari.request_id'] = requestId
  if (code) attributes['hikari.biz_code'] = code
  const outcome: FetchOutcome = response.ok
    ? 'ok'
    : !own
      ? 'external'
      : response.status >= 500
        ? 'fault'
        : 'client_error'
  attributes[ATTR_OUTCOME] = outcome
  if (outcome === 'ok') return { status: 'ok', attributes }
  if (outcome === 'fault') {
    return { status: 'error', message: code ?? `HTTP ${response.status}`, attributes }
  }
  return { status: 'unset', attributes }
}

function failureOf(error: unknown, own: boolean): SpanEnd {
  const type = nameOf(error)
  const outcome: FetchOutcome = type === 'AbortError' ? 'aborted' : own ? 'network' : 'external'
  const attributes: Attributes = { 'error.type': type, [ATTR_OUTCOME]: outcome }
  if (outcome !== 'network') return { status: 'unset', attributes }
  return { status: 'error', message: messageOf(error), attributes }
}

function urlOf(input: RequestInfo | URL, origin: string): string {
  if (typeof input === 'string') return new URL(input, origin).href
  if (input instanceof URL) return input.href
  return input.url
}

function targetOf(url: string, origin: string): URL | null {
  try {
    return new URL(url, origin)
  } catch {
    return null
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message || 'network error'
  return String(error)
}

function nameOf(error: unknown): string {
  return error instanceof Error ? error.name : 'Error'
}
