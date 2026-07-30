import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { defineEventHandler, deleteCookie, getCookie, getQuery, sendRedirect } from 'h3'
import { OIDC_TX_COOKIE, parseOidcTransaction, setSessionCookies } from '../../utils/oidc'

const LOGIN_FAILED = '/login?auth_error=oidc'
const LOGIN_ADMIN_ONLY = '/login?auth_error=admin_only'

export default defineEventHandler(async event => {
  const { oidc, apiBase } = useRuntimeConfig()
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : undefined
  const state = typeof query.state === 'string' ? query.state : undefined

  const tx = parseOidcTransaction(getCookie(event, OIDC_TX_COOKIE))
  deleteCookie(event, OIDC_TX_COOKIE, { path: '/' })

  if (!code || !state || !tx || tx.s !== state) {
    return sendRedirect(event, LOGIN_FAILED, 302)
  }

  let tokens: { access_token?: string; refresh_token?: string; id_token?: string }
  try {
    tokens = await $fetch<{ access_token?: string; refresh_token?: string; id_token?: string }>(
      `${oidc.issuer}/token`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: oidc.redirectUri,
          client_id: oidc.clientId,
          code_verifier: tx.v,
        }).toString(),
      },
    )
  } catch {
    return sendRedirect(event, LOGIN_FAILED, 302)
  }

  if (!tokens.access_token) return sendRedirect(event, LOGIN_FAILED, 302)

  try {
    await $fetch(`${apiBase}/user/me`, {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    })
  } catch (err) {
    const errorCode = (err as { data?: { error?: { code?: string } } }).data?.error?.code
    if (errorCode === HIKARI_BIZ_CODE.AUTH_ADMIN_ONLY) {
      return sendRedirect(event, LOGIN_ADMIN_ONLY, 302)
    }
  }

  setSessionCookies(event, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    id_token: tokens.id_token,
  })

  return sendRedirect(event, tx.r.startsWith('/') ? tx.r : '/', 302)
})
