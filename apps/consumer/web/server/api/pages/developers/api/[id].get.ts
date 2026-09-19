import { createError, getRouterParam, type H3Event } from 'h3'
import { definePageBffHandler } from '../../../../utils/page-bff'
import {
  highlightOperation,
  referenceIndex,
  referenceOperation,
} from '../../../../features/developer/reference'

async function handler(event: H3Event) {
  const config = useRuntimeConfig(event)
  const base = config.public.openApiBase
  const id = getRouterParam(event, 'id') ?? ''

  const found = referenceOperation(base, id)
  if (!found) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const entries = referenceIndex(base)
  const at = entries.findIndex(entry => entry.id === id)

  return {
    open_api_base: base,
    issuer: config.oidc.issuer,
    group: { tag: found.group.tag, title: found.group.title, auth: found.group.auth },
    operation: await highlightOperation(found.operation),
    prev: (at > 0 ? entries[at - 1] : null) ?? null,
    next: (at >= 0 ? entries[at + 1] : null) ?? null,
  }
}

export type DevelopersApiOperationPageData = Awaited<ReturnType<typeof handler>>

export default definePageBffHandler(handler, {
  cache: { header: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
})
