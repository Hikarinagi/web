import { highlightCode } from '../../utils/code-highlight'
const PKCE = [
  'const bytes = crypto.getRandomValues(new Uint8Array(32))',
  'const verifier = btoa(String.fromCharCode(...bytes))',
  "  .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')",
  '',
  'const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))',
  'const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))',
  "  .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')",
  '',
  '// 保存 verifier，回调阶段需用它换取令牌',
  'sessionStorage.setItem("hikari_verifier", verifier)',
].join('\n')

const TOKEN_RESPONSE = [
  '{',
  '  "access_token": "eyJhbGciOiJSUzI1NiIs…",',
  '  "refresh_token": "…",',
  '  "expires_in": 3600,',
  '  "token_type": "Bearer",',
  '  "scope": "status:read status:write"',
  '}',
].join('\n')

const SUCCESS_ENVELOPE = [
  '{',
  '  "success": true,',
  '  "data": { … },',
  '  "request_id": "req-x",',
  '  "timestamp": "2026-08-02T00:00:00.000Z"',
  '}',
].join('\n')

const PAGED_ENVELOPE = [
  '{',
  '  "success": true,',
  '  "data": {',
  '    "items": [ … ],',
  '    "meta": {',
  '      "page": 1,',
  '      "page_size": 20,',
  '      "item_count": 20,',
  '      "total_items": 137,',
  '      "total_pages": 7',
  '    }',
  '  },',
  '  "request_id": "req-x",',
  '  "timestamp": "2026-08-02T00:00:00.000Z"',
  '}',
].join('\n')

const ERROR_ENVELOPE = [
  '{',
  '  "success": false,',
  '  "error": {',
  '    "code": "AUTH_FORBIDDEN",',
  '    "message": "访问令牌缺少此端点所需的 scope：status:write"',
  '  },',
  '  "request_id": "req-x",',
  '  "timestamp": "2026-08-02T00:00:00.000Z"',
  '}',
].join('\n')

function authorizeUrl(authorizationEndpoint: string): string {
  return [
    authorizationEndpoint,
    '  ?response_type=code',
    '  &client_id=$CLIENT_ID',
    '  &redirect_uri=https%3A%2F%2Fyour.app%2Fcallback',
    '  &scope=openid%20status%3Aread%20status%3Awrite%20offline_access',
    '  &state=$RANDOM_STATE',
    '  &nonce=$RANDOM_NONCE',
    '  &code_challenge=$CHALLENGE',
    '  &code_challenge_method=S256',
  ].join('\n')
}

type ClientAuth = 'client_secret_basic' | 'client_secret_post' | 'none'

function exchange(tokenEndpoint: string, auth: ClientAuth): string {
  const lines = [`curl -X POST "${tokenEndpoint}" \\`]
  if (auth === 'client_secret_basic') lines.push('  -u "$CLIENT_ID:$CLIENT_SECRET" \\')
  lines.push('  -d "grant_type=authorization_code" \\')
  if (auth === 'client_secret_post') {
    lines.push('  -d "client_id=$CLIENT_ID" \\')
    lines.push('  -d "client_secret=$CLIENT_SECRET" \\')
  }
  if (auth === 'none') lines.push('  -d "client_id=$CLIENT_ID" \\')
  lines.push('  -d "code=$CODE" \\')
  lines.push('  -d "redirect_uri=https://your.app/callback" \\')
  lines.push('  -d "code_verifier=$VERIFIER"')
  return lines.join('\n')
}

function appTokenCurl(tokenEndpoint: string): string {
  return [
    `curl -X POST "${tokenEndpoint}" \\`,
    '  -u "$CLIENT_ID:$CLIENT_SECRET" \\',
    '  -d "grant_type=client_credentials" \\',
    '  -d "scope=catalog:read"',
  ].join('\n')
}

function appCallCurl(apiBase: string): string {
  return [
    `curl "${apiBase}/open/galgames/1" \\`,
    '  -H "Authorization: Bearer $ACCESS_TOKEN"',
  ].join('\n')
}

export async function buildGuideSnippets(
  tokenEndpoint: string,
  authEndpoint: string,
  apiBase: string,
) {
  const appToken = appTokenCurl(tokenEndpoint)
  const appCall = appCallCurl(apiBase)

  const userCall = [
    `curl -X PUT "${apiBase}/open/user/me/rates/galgames/1" \\`,
    '  -H "Authorization: Bearer $ACCESS_TOKEN" \\',
    '  -H "Content-Type: application/json" \\',
    `  -d '{"status":"COMPLETED","rate":9}'`,
  ].join('\n')

  const refresh = [
    `curl -X POST "${tokenEndpoint}" \\`,
    '  -u "$CLIENT_ID:$CLIENT_SECRET" \\',
    '  -d "grant_type=refresh_token" \\',
    '  -d "refresh_token=$REFRESH_TOKEN"',
  ].join('\n')

  const [
    pkce,
    authorize,
    basicExchange,
    postExchange,
    publicExchange,
    tokenResponse,
    appTokenHtml,
    appCallHtml,
    userCallHtml,
    refreshHtml,
    success,
    paged,
    error,
  ] = await Promise.all([
    highlightCode(PKCE, 'javascript'),
    highlightCode(authorizeUrl(authEndpoint), 'bash'),
    highlightCode(exchange(tokenEndpoint, 'client_secret_basic'), 'bash'),
    highlightCode(exchange(tokenEndpoint, 'client_secret_post'), 'bash'),
    highlightCode(exchange(tokenEndpoint, 'none'), 'bash'),
    highlightCode(TOKEN_RESPONSE, 'json'),
    highlightCode(appToken, 'bash'),
    highlightCode(appCall, 'bash'),
    highlightCode(userCall, 'bash'),
    highlightCode(refresh, 'bash'),
    highlightCode(SUCCESS_ENVELOPE, 'json'),
    highlightCode(PAGED_ENVELOPE, 'json'),
    highlightCode(ERROR_ENVELOPE, 'json'),
  ])

  return {
    pkce: { code: PKCE, html: pkce },
    authorize: { code: authorizeUrl(authEndpoint), html: authorize },
    basic_exchange: {
      code: exchange(tokenEndpoint, 'client_secret_basic'),
      html: basicExchange,
    },
    post_exchange: { code: exchange(tokenEndpoint, 'client_secret_post'), html: postExchange },
    public_exchange: { code: exchange(tokenEndpoint, 'none'), html: publicExchange },
    token_response: { code: TOKEN_RESPONSE, html: tokenResponse },
    app_token: { code: appToken, html: appTokenHtml },
    app_call: { code: appCall, html: appCallHtml },
    user_call: { code: userCall, html: userCallHtml },
    refresh: { code: refresh, html: refreshHtml },
    success_envelope: { code: SUCCESS_ENVELOPE, html: success },
    paged_envelope: { code: PAGED_ENVELOPE, html: paged },
    error_envelope: { code: ERROR_ENVELOPE, html: error },
  }
}
