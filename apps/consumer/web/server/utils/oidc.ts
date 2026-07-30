import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@hikarinagi/shared'
import { deleteCookie, setCookie, type H3Event } from 'h3'

export const OIDC_TX_COOKIE = 'hikari_oidc_tx'

export const AUTH_ID_TOKEN_COOKIE = 'hikari_id_token'

const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
} as const

export interface OidcTransaction {
  v: string // PKCE code_verifier
  s: string // CSRF state
  r: string // post-login return path
}

export interface SessionTokens {
  access_token: string
  refresh_token?: string
  id_token?: string
}

export function parseOidcTransaction(raw: string | undefined): OidcTransaction | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<OidcTransaction>
    if (typeof parsed.v === 'string' && typeof parsed.s === 'string') {
      return { v: parsed.v, s: parsed.s, r: typeof parsed.r === 'string' ? parsed.r : '/' }
    }
  } catch {
    // fall through
  }
  return undefined
}

export function setSessionCookies(event: H3Event, tokens: SessionTokens) {
  setCookie(event, AUTH_ACCESS_TOKEN_COOKIE, tokens.access_token, SESSION_COOKIE_OPTIONS)
  if (tokens.refresh_token) {
    setCookie(event, AUTH_REFRESH_TOKEN_COOKIE, tokens.refresh_token, SESSION_COOKIE_OPTIONS)
  }
  if (tokens.id_token) {
    setCookie(event, AUTH_ID_TOKEN_COOKIE, tokens.id_token, SESSION_COOKIE_OPTIONS)
  }
}

export function clearSessionCookies(event: H3Event) {
  deleteCookie(event, AUTH_ACCESS_TOKEN_COOKIE, { path: '/' })
  deleteCookie(event, AUTH_REFRESH_TOKEN_COOKIE, { path: '/' })
  deleteCookie(event, AUTH_ID_TOKEN_COOKIE, { path: '/' })
}
