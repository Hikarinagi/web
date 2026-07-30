import type { H3Event } from 'h3'
import { definePageBffHandler } from '../../../utils/page-bff'

function handler(event: H3Event) {
  const config = useRuntimeConfig(event)
  return { issuer: config.oidc.issuer }
}

export type DevelopersReferencePageData = Awaited<ReturnType<typeof handler>>

export default definePageBffHandler(handler)
