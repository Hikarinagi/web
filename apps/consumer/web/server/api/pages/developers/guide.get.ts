import type { H3Event } from 'h3'
import { definePageBffHandler } from '../../../utils/page-bff'
import { buildGuideSnippets } from '../../../features/developer/snippets'

async function handler(event: H3Event) {
  const config = useRuntimeConfig(event)
  const issuer = config.oidc.issuer
  const openApiBase = config.public.openApiBase
  const tokenEndpoint = `${issuer}/token`
  const authorizationEndpoint = `${issuer}/auth`

  const snippets = await buildGuideSnippets(tokenEndpoint, authorizationEndpoint, openApiBase)

  return {
    issuer,
    authorization_endpoint: authorizationEndpoint,
    token_endpoint: tokenEndpoint,
    discovery_endpoint: `${issuer}/.well-known/openid-configuration`,
    snippets,
  }
}

export type DevelopersGuidePageData = Awaited<ReturnType<typeof handler>>

export default definePageBffHandler(handler, {
  cache: { header: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
})
