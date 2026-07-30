import { AUTH_REFRESH_TOKEN_COOKIE } from '@hikarinagi/shared'
import {
  defineEventHandler,
  getCookie,
  getHeader,
  getRequestHost,
  readBody,
  setResponseStatus,
} from 'h3'
import { AUTH_ID_TOKEN_COOKIE, clearSessionCookies } from '../../utils/oidc'

export default defineEventHandler(async event => {
  const site = getHeader(event, 'sec-fetch-site')
  if (site) {
    if (site !== 'same-origin' && site !== 'same-site') {
      setResponseStatus(event, 403)
      return null
    }
  } else {
    const origin = getHeader(event, 'origin')
    if (!origin || new URL(origin).host !== getRequestHost(event)) {
      setResponseStatus(event, 403)
      return null
    }
  }

  const { oidc } = useRuntimeConfig()
  const body = await readBody<{ scope?: string }>(event).catch(() => ({}) as { scope?: string })
  const scope = body?.scope === 'local' ? 'local' : 'global'

  const refreshToken = getCookie(event, AUTH_REFRESH_TOKEN_COOKIE)
  const idToken = getCookie(event, AUTH_ID_TOKEN_COOKIE)

  if (refreshToken) {
    try {
      await $fetch(`${oidc.issuer}/token/revocation`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: refreshToken,
          token_type_hint: 'refresh_token',
          client_id: oidc.clientId,
        }).toString(),
      })
    } catch {
      /* empty */
    }
  }

  clearSessionCookies(event)

  if (scope === 'global' && idToken) {
    const origin = new URL(oidc.redirectUri).origin
    const end = new URL(`${oidc.issuer}/session/end`)
    end.searchParams.set('id_token_hint', idToken)
    end.searchParams.set('post_logout_redirect_uri', `${origin}/`)
    end.searchParams.set('client_id', oidc.clientId)
    return { redirect: end.href }
  }

  setResponseStatus(event, 204)
  return null
})
