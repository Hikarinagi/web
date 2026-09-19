import { pathOf } from './redact.js'
import type { Apm, Attributes, SpanEnd } from './types.js'

export interface FetchInstrumentationOptions {
  origin: string
  requestIdHeader?: string
  ignore?: (url: string) => boolean
}

const PATCHED = Symbol.for('hikarinagi.apm.fetch')

type FetchLike = typeof fetch & { [PATCHED]?: boolean }

export function instrumentFetch(apm: Apm, options: FetchInstrumentationOptions): () => void {
  const target = globalThis as { fetch?: FetchLike }
  const original = target.fetch
  if (!original || original[PATCHED]) return () => {}
  const requestIdHeader = (options.requestIdHeader ?? 'hikari-request-id').toLowerCase()

  const patched: FetchLike = async function (
    this: unknown,
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const url = urlOf(input, options.origin)
    if (options.ignore?.(url)) return original.call(this, input, init)
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const { path } = pathOf(url, options.origin)
    const span = apm.startSpan(`${method} ${path}`, {
      kind: 'client',
      attributes: { 'http.request.method': method, 'url.path': path },
    })
    let request = init
    if (sameOrigin(url, options.origin)) {
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      )
      headers.set('traceparent', span.traceparent())
      headers.set('baggage', apm.baggage())
      request = { ...init, headers }
    }
    try {
      const response = await original.call(this, input, request)
      span.end(await outcomeOf(response, requestIdHeader))
      return response
    } catch (error) {
      span.end({
        status: 'error',
        message: messageOf(error),
        attributes: { 'error.type': nameOf(error) },
      })
      throw error
    }
  }
  patched[PATCHED] = true
  target.fetch = patched
  return () => {
    if (target.fetch === patched) target.fetch = original
  }
}

async function outcomeOf(response: Response, requestIdHeader: string): Promise<SpanEnd> {
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
  return {
    status: response.ok ? 'ok' : 'error',
    ...(response.ok ? {} : { message: code ?? `HTTP ${response.status}` }),
    attributes,
  }
}

function urlOf(input: RequestInfo | URL, origin: string): string {
  if (typeof input === 'string') return new URL(input, origin).href
  if (input instanceof URL) return input.href
  return input.url
}

function sameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url, origin).origin === origin
  } catch {
    return false
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error)
    return error.name === 'AbortError' ? 'aborted' : error.message || 'network error'
  return String(error)
}

function nameOf(error: unknown): string {
  return error instanceof Error ? error.name : 'Error'
}
