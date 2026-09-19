import type { H3Event } from 'h3'
import { definePageBffHandler } from '../../../../utils/page-bff'
import { referenceIndex } from '../../../../features/developer/reference'

function handler(event: H3Event) {
  const config = useRuntimeConfig(event)
  return {
    open_api_base: config.public.openApiBase,
    entries: referenceIndex(config.public.openApiBase),
  }
}

export type DevelopersApiIndexPageData = ReturnType<typeof handler>

export default definePageBffHandler(handler, {
  cache: { header: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
})
