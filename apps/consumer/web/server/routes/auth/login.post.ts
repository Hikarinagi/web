import { createHash, randomBytes } from 'node:crypto'
import { defineEventHandler, readBody, sendRedirect, setCookie } from 'h3'
import { OIDC_TX_COOKIE } from '../../utils/oidc'

const base64url = (buf: Buffer) => buf.toString('base64url')

export default defineEventHandler(async event => {
  const { oidc } = useRuntimeConfig()
  const body = await readBody<{ return_to?: string; redirect_to?: string; view?: string }>(event)

  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash('sha256').update(verifier).digest())
  const state = base64url(randomBytes(16))

  const requested = String(body?.return_to ?? body?.redirect_to ?? '/')
  const returnTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  setCookie(event, OIDC_TX_COOKIE, JSON.stringify({ v: verifier, s: state, r: returnTo }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
  })

  const authorize = new URL(`${oidc.issuer}/auth`)
  authorize.searchParams.set('client_id', oidc.clientId)
  authorize.searchParams.set('redirect_uri', oidc.redirectUri)
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('scope', oidc.scopes)
  authorize.searchParams.set('code_challenge', challenge)
  authorize.searchParams.set('code_challenge_method', 'S256')
  authorize.searchParams.set('state', state)
  authorize.searchParams.set('prompt', 'login consent')
  const view = body?.view
  if (view === 'register' || view === 'forgot') authorize.searchParams.set('view', view)

  return sendRedirect(event, authorize.href, 303)
})
