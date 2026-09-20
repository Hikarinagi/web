import {
  ACCEPT_HEADER,
  ACCEPT_LANGUAGE_HEADER,
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  AUTHORIZATION_HEADER,
  CF_CONNECTING_IP_HEADER,
  CONTENT_TYPE_HEADER,
  COOKIE_HEADER,
  HIKARI_APP_VERSION_HEADER,
  HIKARI_AUTH_STALE_HEADER,
  HIKARI_REQUEST_ID_HEADER,
  HIKARI_SEARCH_ENGINE_HEADER,
  IF_MODIFIED_SINCE_HEADER,
  IF_NONE_MATCH_HEADER,
  RATE_LIMIT_LIMIT_HEADER,
  RATE_LIMIT_REMAINING_HEADER,
  RATE_LIMIT_RESET_HEADER,
  RETRY_AFTER_HEADER,
  USER_AGENT_HEADER,
  X_FORWARDED_FOR_HEADER,
  X_REAL_IP_HEADER,
} from '@hikarinagi/shared'
import { appendResponseHeader, getRequestHeaders, setResponseHeader, type H3Event } from 'h3'
import { clearSessionCookies, setSessionCookies, type SessionTokens } from './oidc'

export type BackendRequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT'

interface BackendFetchOptions {
  body?: unknown
  headers: Headers
  ignoreResponseError: true
  method: BackendRequestMethod
  query?: Record<string, unknown>
}

export interface BackendFetchResponse<TData = unknown> {
  _data?: TData
  headers: Headers
  status: number
}

interface BackendAuthContext {
  headers: Headers
}

interface RefreshResult {
  ok: boolean
  tokens?: SessionTokens
  revoked?: boolean
}

interface BackendRequestOptions {
  apiBase: string
  apiPath: string
  body?: unknown
  forwardResponseHeaders?: boolean
  method: BackendRequestMethod
  query?: Record<string, unknown>
  targetUrl: string
}

type BackendFetchRaw = <TData>(
  request: string,
  options: BackendFetchOptions,
) => Promise<BackendFetchResponse<TData>>

const REQUEST_BODY_METHODS = new Set<BackendRequestMethod>(['DELETE', 'PATCH', 'POST', 'PUT'])
const AUTH_PATH_PREFIX = 'auth/'
const UNAUTHENTICATED_STATUS = 401
const EVENT_AUTH_CONTEXT_KEY = 'hikariBackendAuth'
const REFRESH_RESULT_TTL = 10_000
// 因为 auth-init 插件(Nuxt 应用包)与 Nitro 路由(Nitro 包)各自打包，模块之间状态不共享
// IdP 刷新令牌轮换 + 重用检测下，双方各刷一次会撤销授权，故这里按刷新令牌做进程级单飞
const REFRESH_REGISTRY_KEY = '__hikari_backend_refresh_registry__'

function refreshRegistry(): Map<string, Promise<RefreshResult>> {
  const store = globalThis as typeof globalThis & {
    [REFRESH_REGISTRY_KEY]?: Map<string, Promise<RefreshResult>>
  }
  return (store[REFRESH_REGISTRY_KEY] ??= new Map())
}

const REQUEST_HEADER_ALLOW_LIST = [
  ACCEPT_HEADER,
  ACCEPT_LANGUAGE_HEADER,
  AUTHORIZATION_HEADER,
  CF_CONNECTING_IP_HEADER,
  CONTENT_TYPE_HEADER,
  COOKIE_HEADER,
  HIKARI_REQUEST_ID_HEADER,
  IF_MODIFIED_SINCE_HEADER,
  IF_NONE_MATCH_HEADER,
  USER_AGENT_HEADER,
  X_FORWARDED_FOR_HEADER,
  X_REAL_IP_HEADER,
]

const RESPONSE_HEADER_ALLOW_LIST = [
  'cache-control',
  'content-type',
  'etag',
  HIKARI_APP_VERSION_HEADER,
  HIKARI_AUTH_STALE_HEADER,
  HIKARI_REQUEST_ID_HEADER,
  HIKARI_SEARCH_ENGINE_HEADER,
  'last-modified',
  RATE_LIMIT_LIMIT_HEADER,
  RATE_LIMIT_REMAINING_HEADER,
  RATE_LIMIT_RESET_HEADER,
  RETRY_AFTER_HEADER,
]

export async function requestBackendWithAuthRefresh<TData = unknown>(
  event: H3Event,
  options: BackendRequestOptions,
): Promise<BackendFetchResponse<TData>> {
  const auth = getAuthContext(event)
  let response = await requestBackend<TData>(
    options.targetUrl,
    options.method,
    auth.headers,
    options.body,
    options.query,
  )

  if (shouldRefresh(response, options.apiPath, auth.headers)) {
    const refreshed = await refreshBackendAuth(event, auth)
    if (refreshed) {
      response = await requestBackend<TData>(
        options.targetUrl,
        options.method,
        auth.headers,
        options.body,
        options.query,
      )
    }
  }

  if (options.forwardResponseHeaders) {
    copyBackendResponseHeaders(event, response.headers)
  }

  return response
}

function getAuthContext(event: H3Event) {
  const context = event.context as typeof event.context & {
    [EVENT_AUTH_CONTEXT_KEY]?: BackendAuthContext
  }
  context[EVENT_AUTH_CONTEXT_KEY] ??= {
    headers: getProxyHeaders(getRequestHeaders(event)),
  }
  return context[EVENT_AUTH_CONTEXT_KEY]
}

export function serverRuntimeConfig(event: H3Event) {
  const nitro = (
    event.context as { nitro?: { runtimeConfig?: ReturnType<typeof useRuntimeConfig> } }
  ).nitro
  return nitro?.runtimeConfig ?? useRuntimeConfig()
}

async function refreshBackendAuth(event: H3Event, auth: BackendAuthContext) {
  const refreshToken = parseCookieHeader(auth.headers.get(COOKIE_HEADER) ?? '').get(
    AUTH_REFRESH_TOKEN_COOKIE,
  )
  if (!refreshToken) return false

  const { oidc } = serverRuntimeConfig(event)
  const result = await sharedRefresh(refreshToken, oidc.issuer, oidc.clientId)
  if (!result.ok || !result.tokens) {
    if (result.revoked) {
      clearSessionCookies(event)
      clearAuthHeaders(auth.headers)
    }
    return false
  }

  setSessionCookies(event, result.tokens)
  applyTokensToRequestHeaders(auth.headers, result.tokens)
  return true
}

function sharedRefresh(refreshToken: string, issuer: string, clientId: string) {
  const registry = refreshRegistry()
  const existing = registry.get(refreshToken)
  if (existing) return existing

  const pending = requestIdpToken(issuer, clientId, refreshToken)
  registry.set(refreshToken, pending)
  void pending.then(
    () => {
      setTimeout(() => {
        if (registry.get(refreshToken) === pending) registry.delete(refreshToken)
      }, REFRESH_RESULT_TTL)
    },
    () => registry.delete(refreshToken),
  )

  return pending
}

async function requestIdpToken(
  issuer: string,
  clientId: string,
  refreshToken: string,
): Promise<RefreshResult> {
  const fetchRaw = $fetch.raw as BackendFetchRaw
  const response = await fetchRaw<{
    access_token?: string
    refresh_token?: string
    id_token?: string
    error?: string
  }>(`${issuer}/token`, {
    method: 'POST',
    headers: new Headers({ [CONTENT_TYPE_HEADER]: 'application/x-www-form-urlencoded' }),
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }).toString(),
    ignoreResponseError: true,
  })

  const data = response._data
  if (response.status < 200 || response.status >= 300 || !data?.access_token) {
    const revoked = response.status === 400 && data?.error === 'invalid_grant'
    const raw: unknown = response._data
    const body =
      typeof raw === 'string' ? raw.slice(0, 200) : JSON.stringify(raw ?? null).slice(0, 200)
    console.warn(
      `[auth-refresh] token failure rt=${refreshToken.slice(0, 12)} status=${
        response.status
      } error=${data?.error ?? 'none'} revoked=${revoked} server=${
        response.headers.get('server') ?? '?'
      } cf-ray=${response.headers.get('cf-ray') ?? '?'} body=${body}`,
    )
    return { ok: false, revoked }
  }

  return {
    ok: true,
    tokens: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token,
    },
  }
}

async function requestBackend<TData = unknown>(
  targetUrl: string,
  method: BackendRequestMethod,
  headers: Headers,
  body?: unknown,
  query?: Record<string, unknown>,
) {
  const fetchRaw = $fetch.raw as BackendFetchRaw
  return fetchRaw<TData>(targetUrl, {
    method,
    headers,
    body: REQUEST_BODY_METHODS.has(method) && body !== false ? body : undefined,
    query,
    ignoreResponseError: true,
  })
}

function shouldRefresh(response: BackendFetchResponse, apiPath: string, headers: Headers) {
  return (
    !apiPath.startsWith(AUTH_PATH_PREFIX) &&
    hasRefreshToken(headers) &&
    (response.status === UNAUTHENTICATED_STATUS ||
      response.headers.get(HIKARI_AUTH_STALE_HEADER) === '1')
  )
}

function getProxyHeaders(requestHeaders: Record<string, string | undefined>) {
  return REQUEST_HEADER_ALLOW_LIST.reduce((headers, name) => {
    const value = requestHeaders[name]
    if (value) headers.set(name, value)
    return headers
  }, new Headers())
}

function copyBackendResponseHeaders(event: H3Event, headers: Headers) {
  for (const name of RESPONSE_HEADER_ALLOW_LIST) {
    const value = headers.get(name)
    if (value) setResponseHeader(event, name, value)
  }

  for (const cookie of getSetCookieHeaders(headers)) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }
}

function getSetCookieHeaders(headers: Headers) {
  const headersWithCookies = headers as Headers & { getSetCookie?: () => string[] }
  const cookies = headersWithCookies.getSetCookie?.()
  if (cookies?.length) return cookies

  const cookie = headers.get('set-cookie')
  return cookie ? cookie.split(/,(?=\s*[^;,]+=)/).map(item => item.trim()) : []
}

function applyTokensToRequestHeaders(headers: Headers, tokens: SessionTokens) {
  const cookies = parseCookieHeader(headers.get(COOKIE_HEADER) ?? '')
  cookies.set(AUTH_ACCESS_TOKEN_COOKIE, tokens.access_token)
  if (tokens.refresh_token) cookies.set(AUTH_REFRESH_TOKEN_COOKIE, tokens.refresh_token)
  headers.set(COOKIE_HEADER, serializeCookies(cookies))
}

function clearAuthHeaders(headers: Headers) {
  const cookies = parseCookieHeader(headers.get(COOKIE_HEADER) ?? '')
  cookies.delete(AUTH_ACCESS_TOKEN_COOKIE)
  cookies.delete(AUTH_REFRESH_TOKEN_COOKIE)
  const next = serializeCookies(cookies)
  if (next) headers.set(COOKIE_HEADER, next)
  else headers.delete(COOKIE_HEADER)
}

function serializeCookies(cookies: Map<string, string>) {
  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join('; ')
}

function hasRefreshToken(headers: Headers) {
  return parseCookieHeader(headers.get(COOKIE_HEADER) ?? '').has(AUTH_REFRESH_TOKEN_COOKIE)
}

function parseCookieHeader(cookieHeader: string) {
  return cookieHeader.split(';').reduce((cookies, pair) => {
    const normalizedPair = pair.trim()
    const separatorIndex = normalizedPair.indexOf('=')
    if (separatorIndex <= 0) return cookies

    cookies.set(normalizedPair.slice(0, separatorIndex), normalizedPair.slice(separatorIndex + 1))
    return cookies
  }, new Map<string, string>())
}
