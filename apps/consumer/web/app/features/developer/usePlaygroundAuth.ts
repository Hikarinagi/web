import { codeChallenge, randomString } from '~/features/developer/pkce'
import { useApiToken } from '~/features/developer/useApiToken'

const PENDING_KEY = 'hikari:developer:playground-authorize'
export const PLAYGROUND_CALLBACK_PATH = '/developers/playground/callback'

interface Pending {
  verifier: string
  state: string
  clientId: string
  appName: string
  returnTo: string
}

function readPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as Pending) : null
  } catch {
    return null
  }
}

export function playgroundCallbackUrl(origin: string) {
  return `${origin}${PLAYGROUND_CALLBACK_PATH}`
}

export function usePlaygroundAuth() {
  const { save } = useApiToken()

  function redirectUri() {
    return playgroundCallbackUrl(window.location.origin)
  }

  async function authorize(input: {
    authorizationEndpoint: string
    clientId: string
    appName: string
    scopes: string[]
    returnTo: string
  }) {
    const pending: Pending = {
      verifier: randomString(),
      state: randomString(16),
      clientId: input.clientId,
      appName: input.appName,
      returnTo: input.returnTo,
    }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))

    const url = new URL(input.authorizationEndpoint)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', input.clientId)
    url.searchParams.set('redirect_uri', redirectUri())
    url.searchParams.set('scope', input.scopes.join(' '))
    url.searchParams.set('state', pending.state)
    url.searchParams.set('code_challenge', await codeChallenge(pending.verifier))
    url.searchParams.set('code_challenge_method', 'S256')
    window.location.assign(url.toString())
  }

  async function complete(input: { tokenEndpoint: string; query: URLSearchParams }) {
    const pending = readPending()
    sessionStorage.removeItem(PENDING_KEY)

    const error = input.query.get('error')
    if (error) {
      return { ok: false as const, message: errorMessage(error), returnTo: pending?.returnTo }
    }

    const code = input.query.get('code')
    const state = input.query.get('state')
    if (!pending || !code || !state) {
      return { ok: false as const, message: '授权信息不完整，请重新发起授权', returnTo: undefined }
    }
    if (state !== pending.state) {
      return {
        ok: false as const,
        message: 'state 校验未通过，已终止授权',
        returnTo: pending.returnTo,
      }
    }

    const response = await fetch(input.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(),
        code_verifier: pending.verifier,
        client_id: pending.clientId,
      }),
    })
    const payload = (await response.json().catch(() => null)) as {
      access_token?: string
      error_description?: string
      error?: string
    } | null

    if (!response.ok || !payload?.access_token) {
      const detail = payload?.error_description ?? payload?.error ?? `HTTP ${response.status}`
      return { ok: false as const, message: `换取令牌失败：${detail}`, returnTo: pending.returnTo }
    }

    save(payload.access_token, pending.appName)
    return { ok: true as const, message: '', returnTo: pending.returnTo }
  }

  return { authorize, complete }
}

function errorMessage(error: string): string {
  if (error === 'access_denied') return '授权已取消'
  if (error === 'invalid_scope') return '申请的 scope 超出该应用已获授权的范围'
  return `授权失败：${error}`
}
