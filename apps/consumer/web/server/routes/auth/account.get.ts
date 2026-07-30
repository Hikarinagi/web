import { defineEventHandler, sendRedirect } from 'h3'

// Full redirect to the IdP-hosted account management page. The user already holds
// an IdP SSO session from logging in, so /account resolves it same-origin there.
export default defineEventHandler(event => {
  const { oidc } = useRuntimeConfig()
  const base = oidc.issuer.replace(/\/oidc\/?$/, '')
  return sendRedirect(event, `${base}/account`, 302)
})
