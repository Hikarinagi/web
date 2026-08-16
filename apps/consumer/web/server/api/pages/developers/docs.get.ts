import type { H3Event } from 'h3'
import { getRequestURL } from 'h3'
import { definePageBffHandler } from '../../../utils/page-bff'
import { highlightGroups, referenceGroups } from '../../../features/developer/reference'
import { buildGuideSnippets } from '../../../features/developer/snippets'

async function handler(event: H3Event) {
  const issuer = useRuntimeConfig(event).oidc.issuer
  const origin = getRequestURL(event).origin
  const tokenEndpoint = `${issuer}/token`
  const authorizationEndpoint = `${issuer}/auth`

  const [groups, snippets] = await Promise.all([
    highlightGroups(referenceGroups(origin)),
    buildGuideSnippets(tokenEndpoint, authorizationEndpoint, `${origin}/api/v3`),
  ])

  return {
    issuer,
    authorization_endpoint: authorizationEndpoint,
    token_endpoint: tokenEndpoint,
    discovery_endpoint: `${issuer}/.well-known/openid-configuration`,
    snippets,
    groups,
  }
}

export type DevelopersDocsPageData = Awaited<ReturnType<typeof handler>>

export default definePageBffHandler(handler)
